import React, { forwardRef } from 'react';
import { GaugeChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { UniversalTransition } from 'echarts/features';
import { SVGRenderer } from 'echarts/renderers';
import ReactECharts, { EChartsReactProps } from 'echarts-for-react';

echarts.use([
	GaugeChart,
	GridComponent,
	LineChart,
	SVGRenderer,
	UniversalTransition,
	TooltipComponent,
]);

export type ChartRefType = ReactECharts;

const ChartRoot: React.ForwardRefRenderFunction<
	ReactECharts,
	EChartsReactProps
> = (props, ref) => {
	return <ReactECharts ref={ref} {...props} echarts={echarts} />;
};

export const Chart = forwardRef(ChartRoot);
