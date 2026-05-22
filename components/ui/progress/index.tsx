import React, { createContext, useEffect, useRef, useState, useContext } from 'react';
import { Animated, LayoutChangeEvent, View, ViewProps } from 'react-native';

import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';

import { progressFilledTrackStyle, progressStyle } from './styles';

type ProgressVariants = VariantProps<typeof progressStyle>;

const ProgressContext = createContext<{
  isAnimated: boolean;
  orientation: NonNullable<ProgressVariants['orientation']>;
  size: NonNullable<ProgressVariants['size']>;
  trackLength: number;
  value: number;
}>({
  isAnimated: false,
  orientation: 'horizontal',
  size: 'md',
  trackLength: 0,
  value: 0,
});

type ProgressProps = ViewProps &
  ProgressVariants & {
    className?: string;
    isAnimated?: boolean;
    value: number;
  };

const Progress = React.forwardRef<React.ComponentRef<typeof View>, ProgressProps>(function Progress(
  { children, className, isAnimated = false, onLayout, orientation = 'horizontal', size = 'md', value, ...props },
  ref,
) {
  const normalizedValue = Math.max(0, Math.min(100, value));
  const [trackLength, setTrackLength] = useState(0);

  function handleLayout(event: LayoutChangeEvent) {
    const nextTrackLength =
      orientation === 'vertical' ? event.nativeEvent.layout.height : event.nativeEvent.layout.width;

    setTrackLength(nextTrackLength);
    onLayout?.(event);
  }

  return (
    <ProgressContext.Provider
      value={{
        isAnimated,
        orientation,
        size,
        trackLength,
        value: normalizedValue,
      }}
    >
      <View
        ref={ref}
        {...props}
        onLayout={handleLayout}
        className={progressStyle({
          class: className,
          orientation,
          size,
        })}
      >
        {children}
      </View>
    </ProgressContext.Provider>
  );
});

type ProgressFilledTrackProps = ViewProps & { className?: string };

const ProgressFilledTrack = React.forwardRef<React.ComponentRef<typeof View>, ProgressFilledTrackProps>(
  function ProgressFilledTrack({ className, style, ...props }, ref) {
    const { isAnimated, orientation, size, trackLength, value } = useContext(ProgressContext);
    const animatedLength = useRef(new Animated.Value(0)).current;
    const targetLength = (trackLength * value) / 100;

    useEffect(() => {
      if (!isAnimated || trackLength <= 0) return;

      Animated.timing(animatedLength, {
        duration: 350,
        toValue: targetLength,
        useNativeDriver: false,
      }).start();
    }, [animatedLength, isAnimated, targetLength, trackLength]);

    useEffect(() => {
      if (isAnimated || trackLength <= 0) return;

      animatedLength.setValue(targetLength);
    }, [animatedLength, isAnimated, targetLength, trackLength]);

    return (
      <Animated.View
        ref={ref}
        {...props}
        className={progressFilledTrackStyle({
          class: className,
          orientation,
          size,
        })}
        style={[
          style,
          trackLength > 0
            ? orientation === 'vertical'
              ? { height: animatedLength }
              : { width: animatedLength }
            : orientation === 'vertical'
              ? { height: `${value}%` }
              : { width: `${value}%` },
        ]}
      />
    );
  },
);

Progress.displayName = 'Progress';
ProgressFilledTrack.displayName = 'ProgressFilledTrack';

export { Progress, ProgressFilledTrack };
