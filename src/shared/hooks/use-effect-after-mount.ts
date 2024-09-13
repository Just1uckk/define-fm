import { DependencyList, EffectCallback, useEffect } from 'react';

import { useFirstRender } from 'shared/hooks/use-first-render';

export function useEffectAfterMount(
	effect: EffectCallback,
	deps?: DependencyList,
) {
	const isFirst = useFirstRender();

	useEffect(() => {
		if (!isFirst) {
			return effect();
		}
	}, deps);
}
