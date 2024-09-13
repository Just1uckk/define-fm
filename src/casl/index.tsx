import { createContext, useContext } from 'react';
import { createContextualCan } from '@casl/react';
import defineAbilityFor from 'casl/ability';

export type ReturnTypeAbilityContext = ReturnType<typeof defineAbilityFor>;

export const AbilityContext = createContext({} as ReturnTypeAbilityContext);
export const useAbilityContext = () => useContext(AbilityContext);
export const Can = createContextualCan(AbilityContext.Consumer);
