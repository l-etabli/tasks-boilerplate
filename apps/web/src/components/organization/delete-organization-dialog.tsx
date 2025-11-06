import { useRouter } from "@tanstack/react-router";
import type { Organization } from "@tasks/core";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@tasks/ui/components/alert-dialog";
import { toast } from "@tasks/ui/components/sonner";
import { useState } from "react";
import { useI18nContext } from "@/i18n/i18n-react";
import { deleteOrganization } from "@/server/functions/user";

type DeleteOrganizationDialogProps = {
  organization: Organization;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteOrganizationDialog({
  organization,
  open,
  onOpenChange,
}: DeleteOrganizationDialogProps) {
  const router = useRouter();
  const { LL } = useI18nContext();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteOrganization({
        data: {
          organizationId: organization.id,
        },
      });

      toast.success(LL.settings.organizations.organizationDeleted());

      onOpenChange(false);
      router.invalidate();
    } catch (error) {
      console.error("Failed to delete organization:", error);
      toast.error(LL.settings.organizations.organizationDeleteError());
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {LL.settings.organizations.deleteOrganizationDialogTitle()}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {LL.settings.organizations.deleteOrganizationDialogDescription({
              organizationName: organization.name,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{LL.common.cancel()}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {LL.common.delete()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
