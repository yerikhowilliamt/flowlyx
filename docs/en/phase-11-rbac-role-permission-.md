# Phase 11 Documentation: RBAC (Role & Permission)

## Phase Summary

This phase focuses on the implementation and architectural design of the **RBAC (Role & Permission)** module within the Flowlyx platform. Every feature developed in this phase is designed to scale effectively and avoid incurring significant technical debt.

## Work Completed

The primary focus during the **RBAC (Role & Permission)** phase is to specifically design the module's architecture, build data entities, implement business logic in services, and expose the required API endpoints (or UI). Development also includes comprehensive unit testing to ensure core functionalities remain uninterrupted by future phase updates.

## Technology and Tech Stack Selection

Below is a list of technologies, tools, or frameworks that play a crucial role in this phase:

### JWT (JSON Web Token)

- **Reason for Choice:** Facilitates a boundless architecture not tied to single-server memory.
- **Advantages over Alternatives:** Stateless, easily verifiable across services (high scalability).
- **Disadvantages compared to Alternatives:** Revoking unexpired tokens is more complex.

### Argon2

- **Reason for Choice:** The highest modern security standard for hashing user credentials.
- **Advantages over Alternatives:** Memory-hard algorithm, highly resistant to modern GPU/ASIC cracking attacks.
- **Disadvantages compared to Alternatives:** High CPU/RAM consumption, can burden the server during rapid sequential requests.

### Passport.js

- **Reason for Choice:** Provides modularity in login strategies (Local, OAuth).
- **Advantages over Alternatives:** Vast ecosystem, easy to extend authentication methods (Google, GitHub, etc).
- **Disadvantages compared to Alternatives:** Sometimes feels over-abstracted, making debugging harder.
