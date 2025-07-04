import { onMounted, onUnmounted } from "vue";

/**
 * Composable to fix SVG viewBox issues by replacing invalid percentage values with numeric values
 * This is particularly useful for fixing the "Error: <svg> attribute viewBox: Expected number, '0 0 100% 3'" error
 *
 * @returns {Object} Object containing methods for fixing SVG viewBox issues
 */
export function useSvgFix() {
  /**
   * MutationObserver instance for tracking DOM changes
   */
  let observer = null;

  /**
   * Fixes any invalid SVG viewBox attributes in the DOM
   * Replaces percentage values with numeric equivalents
   */
  const fixSvgViewBoxes = () => {
    const svgElements = document.querySelectorAll("svg[viewBox]");
    svgElements.forEach((svg) => {
      const viewBox = svg.getAttribute("viewBox");

      // Check if viewBox contains percentages
      if (viewBox && viewBox.includes("%")) {
        // Parse the viewBox values
        const values = viewBox.split(" ").map((val) => {
          if (val.endsWith("%")) {
            // Convert percentage to a reasonable number
            // For width/height, use the SVG's size when available or a default
            const percentValue = parseFloat(val);
            const parentSize = svg.parentElement?.offsetWidth || 100;
            return Math.round((percentValue * parentSize) / 100);
          }
          return val;
        });

        // Set the fixed viewBox
        const fixedViewBox = values.join(" ");
        svg.setAttribute("viewBox", fixedViewBox);
      }
    });
  };

  /**
   * Sets up a MutationObserver to fix SVG viewBox issues as they appear in the DOM
   */
  const setupSvgFixer = () => {
    // Fix any SVGs already in the DOM
    fixSvgViewBoxes();

    // Create observer to fix any SVGs added dynamically
    observer = new MutationObserver((mutations) => {
      let needsFixing = false;

      // Check if any mutations might have added SVG elements
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length) {
          needsFixing = true;
        } else if (
          mutation.type === "attributes" &&
          mutation.attributeName === "viewBox" &&
          mutation.target.nodeName === "svg"
        ) {
          needsFixing = true;
        }
      });

      // Only run the fix if necessary
      if (needsFixing) {
        fixSvgViewBoxes();
      }
    });

    // Start observing the document
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["viewBox"],
    });
  };

  /**
   * Cleans up the MutationObserver when component is unmounted
   */
  const cleanupSvgFixer = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  // Lifecycle hooks to set up and tear down the SVG fixer
  onMounted(() => {
    setupSvgFixer();
  });

  onUnmounted(() => {
    cleanupSvgFixer();
  });

  return {
    fixSvgViewBoxes,
    setupSvgFixer,
    cleanupSvgFixer,
  };
}
