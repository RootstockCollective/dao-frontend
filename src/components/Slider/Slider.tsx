'use client'

import * as SliderPrimitive from '@radix-ui/react-slider'
import React from 'react'

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Slider>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Slider>
>((props, forwardedRef) => {
  const initialValue = props.value || props.defaultValue
  const [value, setValue] = React.useState(initialValue)

  const onPercentageClick = (percentage: number) => {
    setValue([percentage])
    console.log('percentage', percentage)
  }

  return (
    <>
      <SliderPrimitive.Root
        {...props}
        ref={forwardedRef}
        className="relative flex h-10 touch-none select-none items-center w-full pb-4"
        onValueChange={nextValue => setValue(nextValue)}
      >
        <SliderPrimitive.Track className="relative h-[6px] grow rounded-full bg-input-bg">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary" />

          <span className="flex content-between items-center self-stretch justify-between pt-5 w-full">
            {/* TODO: we may need to fix the click to be more precise */}
            {[0, 25, 50, 75, 100].map(v => (
              <span
                className="max-w-6 text-xs text-center font-kk-topo font-normal hover:cursor-pointer"
                key={v}
                onClick={() => onPercentageClick(v)}
              >
                {v}%
              </span>
            ))}
          </span>
        </SliderPrimitive.Track>
        {value?.map((_, i) => (
          <SliderPrimitive.Thumb
            key={i}
            className="block size-3 rounded-[10px] bg-white shadow-[0_2px_10px] shadow-primary focus:shadow-[0_0_0_2px] focus:shadow-primary focus:outline-none"
            aria-label="Volume"
          />
        ))}
      </SliderPrimitive.Root>
    </>
  )
})

Slider.displayName = SliderPrimitive.Slider.displayName