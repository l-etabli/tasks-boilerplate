/**
 * Convert a File to a serializable format for TanStack Start server functions
 */
export async function fileToSerializable(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  return {
    buffer: Array.from(new Uint8Array(arrayBuffer)),
    filename: file.name,
    mimeType: file.type,
  };
}
