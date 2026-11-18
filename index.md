---
layout: home

hero:
  name: <span class="kmp-word">Kmp</span>Kt<span class="kmp-phonetic">[kəmˈpækt]</span>
  text: CQRS, Event Sourcing, and Messaging for Kotlin
  tagline: Compact by design. Built on compile-time dependency injection.
  image:
    src: /favicon.svg
    alt: KmpKt
  actions:
    - theme: brand
      text: Getting Started
      link: /guide/getting-started
    - theme: alt
      text: Module Guide
      link: /guide/modules
    - theme: alt
      text: GitHub
      link: https://github.com/kmpktio/kmpkt

features:
  - title: Compile-Time DI
    details: Register services, decorators, and handlers in Configuration classes. KSP generates the container at build time.
  - title: CQRS
    details: Use CommandBus, QueryBus, and EventBus standalone without pulling in event sourcing.
  - title: Event Sourcing
    details: Append-only EventStore, AggregateRoot, snapshots, projectors, and policies backed by in-memory or JDBC storage.
  - title: And More
    details: Managed coroutine workers, persistent transports with outbox relay, and integrations for Ktor and Clikt.
---
