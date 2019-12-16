import PropTypes from 'prop-types'
import { useEffect, useState, useRef } from "react"
import ResizeObserver from "resize-observer-polyfill"

export const accessorPropsType = (
    PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.number,
    ])
)

export const useAccessor = (accessor, d, i) => (
    typeof accessor == "function" ? accessor(d, i) : accessor
)

export const dimensionsPropsType = (
    PropTypes.shape({
      height: PropTypes.number,
      width: PropTypes.number,
      marginTop: PropTypes.number,
      marginRight: PropTypes.number,
      marginBottom: PropTypes.number,
      marginLeft: PropTypes.number,
    })
)

export const combineChartDimensions = dimensions => {
  let parsedDimensions = {
    marginTop: 40,
    marginRight: 30,
    marginBottom: 40,
    marginLeft: 75,
    ...dimensions,
  }

  return {
    ...parsedDimensions,
    boundedHeight: Math.max(parsedDimensions.height - parsedDimensions.marginTop - parsedDimensions.marginBottom, 0),
    boundedWidth: Math.max(parsedDimensions.width - parsedDimensions.marginLeft - parsedDimensions.marginRight, 0),
  }
}

export const useChartDimensions = passedSettings => {
  const ref = useRef();
  const dimensions = combineChartDimensions(passedSettings)
  const [width, changeWidth] = useState(0)
  const [height, changeHeight] = useState(0)

  useEffect(() => {
      if(ref.current) {
          const element = ref.current;
          const resizeObserver = new ResizeObserver(entries => {
              if (!Array.isArray(entries)) return;
              if (!entries.length) return;
              const entry = entries[0];
              if(entry && entry.parentElement && entry.parentElement.offsetWidth){
                if (width !== entry.parentElement.offsetWidth) changeWidth(entry.parentElement.offsetWidth);
                if (height !== entry.parentElement.offsetHeight) changeHeight(entry.parentElement.offsetHeight);
              }
          });

          resizeObserver.observe(element);

          return () => resizeObserver.unobserve(element);
      }
  }, [ref])

  const newSettings = combineChartDimensions({
    ...dimensions,
    width: dimensions.width || width,
    height: dimensions.height || height,
  });
    //if (dimensions.width && dimensions.height) return [ref, dimensions];
    return [ref, newSettings]
}

let lastId = 0
export const useUniqueId = (prefix="") => {
  lastId++
  return [prefix, lastId].join("-")
}



export function useFakeSvgDrag() {
    const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);

    return {
        coordinates,
        startDrag: coordinates => {
            setDragging(true);
        },
        drag: coordinates => {
            if (dragging) {
                setCoordinates(coordinates);
            }
        },
        stopDrag: _ => {
            setDragging(false);
        }
    };
}
