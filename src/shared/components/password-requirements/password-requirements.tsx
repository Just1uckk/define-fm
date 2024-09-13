import React, { useMemo } from 'react';
import { chunk } from 'lodash';
import styled from 'styled-components';

import { PasswordSettings, ValidationPasswordErrors } from 'shared/types/users';

import { useTranslation } from 'shared/hooks/use-translation';

import { Text } from 'shared/components/text/text';

const List = styled.div`
	display: flex;
	column-gap: 2rem;
	margin-top: 0.3rem;
`;

const Column = styled.div`
	&:not(:last-child) {
	}
`;

const Rule = styled(Text)`
	display: flex;
	align-items: center;
	margin-top: 0.2rem;

	&:first-child {
		margin-top: 0;
	}
`;

const Indicator = styled.div<{ isNotActive: boolean }>`
	align-self: flex-start;
	width: 6px;
	height: 6px;
	margin-top: 0.32rem;
	margin-right: 0.5rem;
	background-color: ${({ theme, isNotActive }) =>
		isNotActive ? theme.colors.secondary : theme.colors.accent};
	opacity: ${({ isNotActive }) => (isNotActive ? '0.5' : '1')};
	border-radius: 50%;
`;

interface PasswordRequirementsProps {
	passwordSettings?: PasswordSettings;
	errors?: ValidationPasswordErrors;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
	errors = {},
	passwordSettings,
}) => {
	const { t, currentLang } = useTranslation();

	const {
		notContainUpper = false,
		notContainLower = false,
		notContainDigit = false,
		notContainSymbol = false,
		minLength = false,
		maxLength = false,
	} = errors;

	const requirements = useMemo(() => {
		const elements: React.ReactNode[] = [];

		if (passwordSettings?.shouldContainLower.value === 'true') {
			elements.unshift(
				<Rule
					key="lower"
					variant={notContainLower ? 'body_3_secondary' : 'body_3_primary'}
				>
					<Indicator isNotActive={notContainLower} />
					{t('components.user_password_requirements.one_lowercase')}
				</Rule>,
			);
		}
		if (passwordSettings?.shouldContainUpper.value === 'true') {
			elements.push(
				<Rule
					key="upper"
					variant={notContainUpper ? 'body_3_secondary' : 'body_3_primary'}
				>
					<Indicator isNotActive={notContainUpper} />
					{t('components.user_password_requirements.one_uppercase')}
				</Rule>,
			);
		}
		if (passwordSettings?.shouldContainDigit.value === 'true') {
			elements.push(
				<Rule
					key="number"
					variant={notContainDigit ? 'body_3_secondary' : 'body_3_primary'}
				>
					<Indicator isNotActive={notContainDigit} />
					{t('components.user_password_requirements.one_number')}
				</Rule>,
			);
		}
		if (passwordSettings?.shouldContainSymbol.value === 'true') {
			elements.push(
				<Rule
					key="special"
					variant={notContainSymbol ? 'body_3_secondary' : 'body_3_primary'}
				>
					<Indicator isNotActive={notContainSymbol} />
					{t('components.user_password_requirements.one_special')}
				</Rule>,
			);
		}

		elements.push(
			<Rule
				key="min"
				variant={minLength ? 'body_3_secondary' : 'body_3_primary'}
			>
				<Indicator isNotActive={minLength} />
				{t('components.user_password_requirements.min_length', {
					length: passwordSettings?.min?.value,
				})}
			</Rule>,
			<Rule
				key="max"
				variant={maxLength ? 'body_3_secondary' : 'body_3_primary'}
			>
				<Indicator isNotActive={maxLength} />
				{t('components.user_password_requirements.max_length', {
					length: passwordSettings?.max?.value,
				})}
			</Rule>,
		);

		return elements;
	}, [
		currentLang,
		passwordSettings,
		notContainLower,
		notContainUpper,
		notContainDigit,
		notContainSymbol,
		minLength,
		maxLength,
	]);

	const splitRequirements = useMemo(() => {
		if (requirements.length < 4) {
			return [requirements];
		}

		return chunk(requirements, 2);
	}, [requirements]);

	return (
		<List>
			{splitRequirements.map((chunk, idx) => (
				<Column key={idx}>{chunk}</Column>
			))}
		</List>
	);
};
