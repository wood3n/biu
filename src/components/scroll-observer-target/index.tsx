import React, { useEffect } from 'react';

interface Props {
  stickyElSelector: string;
  deps?: React.DependencyList;
}

/**
 * 滚动子元素添加box-shadow
 */
const ScrollObserverTarget = ({
  stickyElSelector,
  deps = [],
}: Props) => {
  useEffect(() => {
    const observerTargets = document.querySelectorAll('.scroll-observer-target');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const subheader = entry.target.parentElement?.querySelector(stickyElSelector);
        subheader?.classList.toggle('sticky-subheader', !entry.isIntersecting);
      });
    }, {
      threshold: [0, 1],
    });

    if (observerTargets.length) {
      observerTargets.forEach((target) => {
        observer?.observe(target);
      });
    }

    return () => {
      observer?.disconnect();
    };
  }, deps);

  return (
    <div
      className="scroll-observer-target"
      style={{
        position: 'absolute',
        height: 1,
      }}
    />
  );
};

export default ScrollObserverTarget;
