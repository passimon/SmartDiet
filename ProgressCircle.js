import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';

// Helper: convert polar coordinates to Cartesian
const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

// Helper: describe an arc path given center, radius, start angle and sweep angle.
const describeArc = (x, y, radius, startAngle, sweepAngle) => {
  const endAngle = startAngle + sweepAngle;
  const start = polarToCartesian(x, y, radius, startAngle);
  const end = polarToCartesian(x, y, radius, endAngle);
  const largeArcFlag = sweepAngle <= 180 ? '0' : '1';
  return `
    M ${start.x} ${start.y}
    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}
  `;
};

const ProgressCircle = ({
  size = 70,
  strokeWidth = 5,
  progress = 0, // Can be > 1 (100%)
  backgroundColor = '#f0f0f0',
  progressColor = '#007BFF',
  label,
  valueText,
}) => {
  const halfSize = size / 2;
  const radius = halfSize - strokeWidth / 2;

  // Compute base progress (up to 100%) and extra progress (over the limit)
  const baseProgress = Math.min(progress, 1);
  const baseAngle = 360 * baseProgress;
  const extraProgress = progress > 1 ? progress - 1 : 0;
  const extraAngle = 360 * extraProgress;

  // Create arc paths
  const basePath = describeArc(halfSize, halfSize, radius, -90, baseAngle);
  const extraPath =
    extraProgress > 0
      ? describeArc(halfSize, halfSize, radius, -90 + baseAngle, extraAngle)
      : null;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          stroke={backgroundColor}
          fill="none"
          cx={halfSize}
          cy={halfSize}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Base arc (within limit) */}
        {baseProgress > 0 && (
          <Path
            d={basePath}
            stroke={progressColor}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
          />
        )}
        {/* Extra arc (exceeding limit) */}
        {extraPath && (
          <G
            transform={`scale(1.08) translate(${-(size * 0.04)}, ${-(size * 0.04)})`}
          >
            <Path
              d={extraPath}
              stroke="red"
              fill="none"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          </G>
        )}
      </Svg>
      <View style={styles.textContainer}>
        {label && <Text style={styles.label}>{label}</Text>}
        {valueText && <Text style={styles.valueText}>{valueText}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    textAlign: 'center',
  },
  valueText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ProgressCircle;
