import styled from 'styled-components';

import { Text } from 'shared/components/text/text';

export const ProfileSettingsField = styled.div`
	padding: 0.5rem 1rem;
	flex-grow: 1;
`;

export const ProfileSettingsFieldLabel = styled(Text).attrs(() => ({
	variant: 'body_6_secondary',
}))``;
