import styled from 'styled-components';

import { Spinner } from 'shared/components/spinner/spinner';

export const PageSpinner = styled(Spinner)`
	position: absolute;
	top: 30%;
	left: 50%;
	transform: translateY(-50%);
`;
