import type { OpenSlideConfig } from '@open-slide/core';

const openSlideConfig: OpenSlideConfig = {
  // 8181, not the 5173 default: the 517x range is reserved for another project on this
  // machine, and open-slide silently walks to the next free port if 5173 is taken — which
  // makes "which server am I looking at?" a live-demo problem.
  port: 8181,
};

export default openSlideConfig;
