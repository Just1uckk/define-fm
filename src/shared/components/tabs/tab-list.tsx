import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { debounce } from 'lodash';
import styled from 'styled-components';

import { useEffectAfterMount } from 'shared/hooks/use-effect-after-mount';

const Wrapper = styled.div`
	position: relative;
	display: flex;

	&::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 2px;
		background-color: ${({ theme }) =>
			theme.tabs.activeIndicator.backgroundColor};
	}
`;

const Underline = styled.div`
	position: absolute;
	bottom: 0;
	left: 0;
	height: 2px;
	background-color: ${({ theme }) => theme.tabs.activeIndicator.color};
	z-index: 1;
`;

interface TabListProps {
	className?: string;
	value?: number;
}

export const TabList: React.FC<React.PropsWithChildren<TabListProps>> = ({
	className,
	value,
	children: childrenProp,
}) => {
	const tabsRef = useRef() as React.MutableRefObject<HTMLDivElement>;
	const indicatorRef = useRef() as React.MutableRefObject<HTMLDivElement>;

	useLayoutEffect(() => {
		calculateIndicatorData();
	}, [value, tabsRef.current, indicatorRef.current]);

	useEffectAfterMount(() => {
		if (!indicatorRef.current) return;

		indicatorRef.current.style.transition = `left 0.3s, width 0.2s ease`;
	}, [indicatorRef.current]);

	useEffect(() => {
		const handleResize = debounce(() => {
			calculateIndicatorData();
		});

		let resizeObserver;

		if (typeof ResizeObserver !== 'undefined') {
			resizeObserver = new ResizeObserver(handleResize);
			resizeObserver.observe(tabsRef.current);
		} else {
			window.addEventListener('resize', handleResize);
		}

		return () => {
			window.removeEventListener('resize', handleResize);
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
		};
	}, [tabsRef.current, value]);

	function calculateIndicatorData() {
		const tabsEl = tabsRef.current;
		const indicatorEl = indicatorRef.current;

		if (!tabsEl || !indicatorEl) return;

		if (value !== undefined) {
			const activeTab = tabsEl.children[value] as HTMLElement;
			const activeTabMeta = activeTab.getBoundingClientRect();

			indicatorEl.style.width = `${activeTabMeta.width}px`;
			indicatorEl.style.left = `${activeTab.offsetLeft}px`;
		}
	}

	const children = React.Children.map(childrenProp, (child, idx) => {
		if (!React.isValidElement(child)) {
			return null;
		}

		return React.cloneElement(child, {
			isActive: idx === value,
			...child.props,
		});
	});

	return (
		<Wrapper role="tablist" ref={tabsRef} className={className}>
			{children}
			<Underline ref={indicatorRef} role="presentation" />
		</Wrapper>
	);
};
