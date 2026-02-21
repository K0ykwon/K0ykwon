"use client";

import { useEffect, useRef } from "react";

function getGiscusTheme() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function sendThemeToGiscus(theme: string) {
  const iframe = document.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
  if (!iframe) return;
  iframe.contentWindow?.postMessage(
    { giscus: { setConfig: { theme } } },
    "https://giscus.app"
  );
}

export default function GiscusComments() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || ref.current.hasChildNodes()) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "K0ykwon/K0ykwon");
    script.setAttribute("data-repo-id", "R_kgDOQKO2xw");
    script.setAttribute("data-category", "General");
    script.setAttribute("data-category-id", "DIC_kwDOQKO2x84C267f");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", getGiscusTheme());
    script.setAttribute("data-lang", "ko");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    ref.current.appendChild(script);

    // html 클래스 변화(다크모드 토글) 감지 → Giscus 테마 동기화
    const observer = new MutationObserver(() => {
      sendThemeToGiscus(getGiscusTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className="mt-16" />;
}
