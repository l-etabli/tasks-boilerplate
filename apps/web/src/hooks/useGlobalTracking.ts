import { useEffect } from "react";
import { useCurrentUser } from "@/providers/SessionProvider";

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, unknown>) => void;
      identify: (id: string, data?: Record<string, unknown>) => void;
    };
  }
}

export function useGlobalTracking() {
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    if (currentUser?.id && window.umami) {
      window.umami.identify(currentUser.id, {
        email: currentUser.email,
        name: currentUser.name || undefined,
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.umami) return;

    const trackElement = (element: HTMLElement, eventType: string) => {
      const elementId = element.id || element.getAttribute("data-id") || undefined;
      const elementTag = element.tagName.toLowerCase();
      const elementText = element.textContent?.trim().slice(0, 50) || undefined;

      const umamiData: Record<string, unknown> = {};

      for (const attr of element.attributes) {
        if (attr.name.startsWith("data-umami-")) {
          const key = attr.name.replace("data-umami-", "");
          umamiData[key] = attr.value;
        }
      }

      const eventData = {
        elementId,
        elementTag,
        elementText,
        eventType,
        ...umamiData,
      };

      const eventName = elementId || `${elementTag}-click`;
      window.umami?.track(eventName, eventData);
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      const clickableElement = target.closest("button, a, [role='button']");
      if (clickableElement instanceof HTMLElement) {
        trackElement(clickableElement, "click");
      }
    };

    const handleSubmit = (event: SubmitEvent) => {
      const target = event.target as HTMLFormElement;
      if (!target) return;

      const formId = target.id || target.getAttribute("name") || "unnamed-form";
      const eventData = {
        formId,
        elementTag: "form",
        eventType: "submit",
      };

      window.umami?.track(`${formId}-submit`, eventData);
    };

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, []);
}
