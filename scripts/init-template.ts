#!/usr/bin/env tsx

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import * as readline from "node:readline/promises";

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const colors = {
	reset: "\x1b[0m",
	bold: "\x1b[1m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	red: "\x1b[31m",
};

function log(message: string, color = colors.reset) {
	console.log(`${color}${message}${colors.reset}`);
}

function validateNamespace(namespace: string): boolean {
	// Must start with @ and contain only valid npm scope characters
	const regex = /^@[a-z0-9-]+$/;
	return regex.test(namespace);
}

async function promptNamespace(): Promise<string> {
	while (true) {
		const answer = await rl.question(
			`${colors.blue}Enter new package namespace (e.g., @myapp, @company):${colors.reset} `,
		);
		const namespace = answer.trim();

		if (!namespace) {
			log("Namespace cannot be empty", colors.red);
			continue;
		}

		if (!validateNamespace(namespace)) {
			log(
				"Invalid namespace. Must start with @ and contain only lowercase letters, numbers, and hyphens (e.g., @myapp, @my-company)",
				colors.red,
			);
			continue;
		}

		return namespace;
	}
}

async function confirmAction(message: string): Promise<boolean> {
	const answer = await rl.question(
		`${colors.yellow}${message} (yes/no):${colors.reset} `,
	);
	return answer.trim().toLowerCase() === "yes";
}

function findAndReplace(content: string, oldNs: string, newNs: string): string {
	// Replace all occurrences of the old namespace with the new one
	// Use regex with global flag for compatibility
	return content.replace(new RegExp(oldNs.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newNs);
}

function processFile(
	filePath: string,
	oldNamespace: string,
	newNamespace: string,
): boolean {
	try {
		const content = readFileSync(filePath, "utf-8");
		const newContent = findAndReplace(content, oldNamespace, newNamespace);

		if (content !== newContent) {
			writeFileSync(filePath, newContent, "utf-8");
			return true;
		}
		return false;
	} catch (error) {
		log(`Error processing ${filePath}: ${error}`, colors.red);
		return false;
	}
}

async function main() {
	log("\n╔═══════════════════════════════════════════════════════════╗", colors.bold);
	log("║  Template Initialization Script                          ║", colors.bold);
	log("╚═══════════════════════════════════════════════════════════╝\n", colors.bold);

	const currentNamespace = "@tasks";

	// Check if we're running on the template repository itself
	try {
		const gitRemote = execSync("git remote get-url origin", {
			encoding: "utf-8",
		}).trim();

		if (
			gitRemote.includes("tasks-boilerplate") ||
			gitRemote.includes("l-etabli/tasks")
		) {
			log(
				"\n⚠️  WARNING: This appears to be the template repository itself!",
				colors.yellow,
			);
			log(
				"This script should only be run on projects created from the template.\n",
				colors.yellow,
			);

			const confirmTemplate = await confirmAction(
				"Are you sure you want to proceed?",
			);
			if (!confirmTemplate) {
				log("\nOperation cancelled.", colors.yellow);
				rl.close();
				process.exit(0);
			}
		}
	} catch (error) {
		// No git remote or other error - probably fine to continue
	}

	log(`Current namespace: ${colors.yellow}${currentNamespace}${colors.reset}`);
	log("This script will replace it across your entire project.\n");

	const newNamespace = await promptNamespace();

	log(`\n${colors.bold}Preview of changes:${colors.reset}`);
	log(`  ${colors.red}${currentNamespace}${colors.reset} → ${colors.green}${newNamespace}${colors.reset}\n`);

	const confirmed = await confirmAction("Proceed with namespace replacement?");
	if (!confirmed) {
		log("\nOperation cancelled.", colors.yellow);
		rl.close();
		process.exit(0);
	}

	log("\n🔄 Starting replacement...\n", colors.blue);

	// Files and patterns to process
	const filesToProcess = [
		// Package.json files
		"package.json",
		"apps/web/package.json",
		"packages/core/package.json",
		"packages/db/package.json",
		"packages/ui/package.json",
		"packages/trousse/package.json",
		"packages/test/package.json",
		"packages/typescript-config/package.json",
		// TypeScript configs
		"tsconfig.json",
		"apps/web/tsconfig.json",
		"packages/core/tsconfig.json",
		"packages/db/tsconfig.json",
		"packages/ui/tsconfig.json",
		"packages/ui/tsconfig.lint.json",
		"packages/trousse/tsconfig.json",
		"packages/test/tsconfig.json",
		// shadcn/ui configs
		"apps/web/components.json",
		"packages/ui/components.json",
		// Build configs
		"apps/web/Dockerfile",
		// Documentation
		"README.md",
		"SETUP.md",
		"CLAUDE.md",
	];

	let processedCount = 0;

	// Process specific files
	for (const file of filesToProcess) {
		const fullPath = join(process.cwd(), file);
		if (existsSync(fullPath)) {
			if (processFile(fullPath, currentNamespace, newNamespace)) {
				log(`  ✓ ${file}`, colors.green);
				processedCount++;
			}
		}
	}

	// Process all TypeScript/TSX files for imports
	log("\n🔍 Processing TypeScript files...", colors.blue);
	try {
		const tsFiles = execSync(
			'find . -type f \\( -name "*.ts" -o -name "*.tsx" \\) -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/.output/*" -not -path "*/dist/*"',
			{ encoding: "utf-8" },
		)
			.trim()
			.split("\n")
			.filter(Boolean);

		for (const file of tsFiles) {
			if (processFile(file, currentNamespace, newNamespace)) {
				processedCount++;
			}
		}
		log(`  ✓ Processed ${tsFiles.length} TypeScript files`, colors.green);
	} catch (error) {
		log(`  ⚠ Error processing TypeScript files: ${error}`, colors.yellow);
	}

	log(`\n✅ Complete! Updated ${processedCount} files.\n`, colors.green);

	// Clean up template initialization files
	const cleanupFiles = [
		".github/workflows/template-init.yml",
		"scripts/init-template.ts",
	];

	log("\n🧹 Cleaning up template initialization files...\n", colors.blue);
	const { unlinkSync } = await import("node:fs");
	for (const file of cleanupFiles) {
		const fullPath = join(process.cwd(), file);
		if (existsSync(fullPath)) {
			unlinkSync(fullPath);
			log(`  ✓ Removed ${file}`, colors.green);
		}
	}

	// Suggest next steps
	log(`\n${colors.bold}Next steps:${colors.reset}`);
	log("  1. Review the changes: git diff");
	log("  2. Delete all existing tags: git tag | xargs -n 1 git push --delete origin; git tag | xargs -n 1 git tag -d");
	log("  3. Commit the changes: git add -A && git commit -m 'chore: initialize template'");
	log("  4. Create initial tags: git tag -a 0.0.1 -m 'chore: initial version' && git tag -fa latest -m 'chore: initial version'");
	log("  5. Push changes: git push && git push origin 0.0.1 && git push origin latest --force");
	log("  6. Reinstall dependencies: pnpm install");
	log("  7. Verify everything works: pnpm fullcheck");
	log("  8. Update .env with your configuration");
	log("  9. Start development: pnpm dev\n");

	rl.close();
}

main().catch((error) => {
	log(`\n❌ Error: ${error.message}`, colors.red);
	rl.close();
	process.exit(1);
});
