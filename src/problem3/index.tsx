/*
interface WalletBalance {
  currency: string;
  amount: number;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {

}
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

	const getPriority = (blockchain: any): number => {
	  switch (blockchain) {
	    case 'Osmosis':
	      return 100
	    case 'Ethereum':
	      return 50
	    case 'Arbitrum':
	      return 30
	    case 'Zilliqa':
	      return 20
	    case 'Neo':
	      return 20
	    default:
	      return -99
	  }
	}

  const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
		  const balancePriority = getPriority(balance.blockchain);
		  if (lhsPriority > -99) {
		     if (balance.amount <= 0) {
		       return true;
		     }
		  }
		  return false
		}).sort((lhs: WalletBalance, rhs: WalletBalance) => {
			const leftPriority = getPriority(lhs.blockchain);
		  const rightPriority = getPriority(rhs.blockchain);
		  if (leftPriority > rightPriority) {
		    return -1;
		  } else if (rightPriority > leftPriority) {
		    return 1;
		  }
    });
  }, [balances, prices]);

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed()
    }
  })

  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow 
        className={classes.row}
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    )
  })

  return (
    <div {...rest}>
      {rows}
    </div>
  )
}
*/

import React, {useMemo} from 'react';

type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface WalletBalance {
  currency: string;
  amount: number;

  // Issue: original interface did not include `blockchain`,
  // Status: FIXED
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

// Issue: empty interface `Props extends BoxProps {}` is unnecessary.
// Status: FIXED
type Props = BoxProps;

// Issue: priority values were hardcoded inside a switch statement.
// Status: FIXED
const BLOCKCHAIN_PRIORITY: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

// Issue: `getPriority` was declared inside the component,
// Moved outside component so it is never recreated.
// Status: FIXED
const getPriority = (blockchain: string): number => {
  return BLOCKCHAIN_PRIORITY[blockchain] ?? -99;
};

// stubs for hooks/components that would be provided by the app
declare function useWalletBalances(): WalletBalance[];
declare function usePrices(): Record<string, number>;
declare function WalletRow(props: {
  className?: string,
  amount: number,
  usdValue: number,
  formattedAmount: string,
  key?: string
}): React.ReactElement;
declare const classes: { row: string };

const WalletPage: React.FC<Props> = (props) => {
  const { children, ...rest } = props;

  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances = useMemo<FormattedWalletBalance[]>(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);

        // Issue: original code used undefined variable `lhsPriority`.
        // Status: FIXED

        // Issue: original filter kept balances with amount <= 0,
        // Status: FIXED

        // Issue: original filter had unnecessary nested if statements.
        // Status: FIXED
        return priority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        // Issue: original sort callback did not return anything when priorities were equal, which can cause unstable behavior.
        // Status: FIXED
        return getPriority(rhs.blockchain) - getPriority(lhs.blockchain);
      })
      .map((balance: WalletBalance) => {
        // Issue: original code calculated formattedBalances, but then rendered from sortedBalances instead.
        // Status: FIXED

        // Issue: original code could produce NaN if price was missing. Defaulting missing prices to 0 prevents NaN.
        // Status: FIXED
        const price = prices[balance.currency] ?? 0;

        return {
          ...balance,

          // Issue: original `toFixed()` used no decimal argument, so values like 1.234 became "1".
          // Status: FIXED
          formatted: balance.amount.toFixed(2),

          usdValue: price * balance.amount,
        };
      });

    // Issue: original useMemo depended on `prices`,
    // Status: FIXED
  }, [balances, prices]);

  return (
    // Issue: original code spread BoxProps onto a plain div. If BoxProps comes from a UI library like MUI, use Box instead.
    // Status: FIXED
    <Box {...rest}>
      {formattedBalances.map((balance) => (
        <WalletRow
          className={classes.row}

          // Issue: original code used index as key.
          // Status: FIXED
          key={`${balance.blockchain}-${balance.currency}`}

          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      ))}

      {/* Issue: original code extracted children but never rendered them.
          Status: FIXED */}
      {children}
    </Box>
  );
};

export default WalletPage;
