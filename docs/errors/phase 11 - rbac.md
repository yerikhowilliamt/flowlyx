# Phase 11 - RBAC: PowerShell Invalid Statement Separator

## Symptoms

During the execution of version control commands, the terminal returned a `ParserError`:
`The token '&&' is not a valid statement separator in this version.`

## Root Cause

The command `git add . && git commit -m "..."` was executed in a PowerShell terminal environment. Unlike Bash or Zsh, older versions of Windows PowerShell do not support the `&&` operator to chain commands sequentially.

## Investigation

The error message explicitly pointed to the `&&` token. It was identified that the terminal runner is operating on Windows with PowerShell, which handles command chaining differently (e.g., using `;` or requiring PowerShell 7+ for `&&`).

## Solution

The compound command was split into two separate, sequential commands:

1. `git add .`
2. `git commit -m "feat(api): implement RBAC module with decorators and guards"`

## Trade-offs

Executing the commands separately means the second command will run even if the first one conceptually fails (though `git add .` rarely fails). However, this is a necessary trade-off to ensure commands run successfully in a cross-platform Windows environment without requiring PowerShell upgrades.

## Prevention

- Avoid using POSIX-specific shell operators like `&&` or `||` in scripts or automated commands unless the environment is guaranteed to be POSIX-compliant.
- For Node.js `package.json` scripts, use tools like `npm-run-all` or rely on cross-platform script runners to handle sequential execution safely.

## References

- Microsoft PowerShell Documentation: [About Pipeline Chain Operators](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_pipeline_chain_operators)
