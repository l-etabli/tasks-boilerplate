import { ImageUpload as UIImageUpload } from "@tasks/ui/components/image-upload";
import { useI18nContext } from "@/i18n/i18n-react";

type ImageUploadProps = Omit<
  React.ComponentProps<typeof UIImageUpload>,
  | "noImageYet"
  | "upload"
  | "change"
  | "errorFileType"
  | "errorFileSize"
  | "helpText"
  | "removeLabel"
>;

export function ImageUpload(props: ImageUploadProps) {
  const { LL } = useI18nContext();

  return (
    <UIImageUpload
      {...props}
      noImageYet={LL.imageUpload.noImageYet()}
      upload={LL.imageUpload.upload()}
      change={LL.imageUpload.change()}
      errorFileType={LL.imageUpload.errorFileType()}
      errorFileSize={LL.imageUpload.errorFileSize()}
      helpText={LL.imageUpload.helpText()}
      removeLabel={LL.imageUpload.removeLabel()}
    />
  );
}
