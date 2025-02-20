import React, { useEffect } from "react";

interface Props {
  searchInParent?: boolean;
  stickyElSelector: string;
  deps?: React.DependencyList;
  id?: string;
}

/**
 * 滚动子元素添加box-shadow
 */
function ScrollObserverTarget({ searchInParent, stickyElSelector, deps, id }: Props) {
  useEffect(() => {
    const observerTargets = document.querySelectorAll(".scroll-observer-target");
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const subheader = searchInParent ? entry.target.parentElement?.querySelector(stickyElSelector) : document.querySelector(stickyElSelector);
          subheader?.classList.toggle("sticky-subheader", !entry.isIntersecting);
        });
      },
      {
        threshold: [0, 1],
      },
    );

    if (observerTargets.length) {
      observerTargets.forEach(target => {
        observer?.observe(target);
      });
    }

    return () => {
      observer?.disconnect();
    };
  }, deps || []);

  return (
    <div
      id={id}
      className="scroll-observer-target"
      style={{
        position: "absolute",
        height: 1,
      }}
    />
  );
}

export default ScrollObserverTarget;
