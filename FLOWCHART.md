# System & Workflow Flowchart - Skill Exchange Platform

This document describes the complete operational and decision-making flowcharts for the **Skill Exchange Platform**.

> 💡 **Visual Excalidraw Canvas**: An interactive visual flowchart matching this design is available in [`flowchart.excalidraw`](file:///flowchart.excalidraw). Open it in VS Code to view, edit, or customize on canvas!

---

## 1. End-to-End System Workflow (Mermaid)

```mermaid
flowchart TD
    %% =======================
    %% ENTRY & AUTHENTICATION
    %% =======================
    START([User Visits Platform]):::startNode --> D_AUTH{User<br/>Registered?}:::decisionNode
    D_AUTH -- No --> P_SIGNUP[Firebase Signup / Login]:::processNode
    P_SIGNUP --> P_PROFILE[Setup Profile<br/>Skills, Hourly Rate, Bio]:::processNode
    P_PROFILE --> P_DASH[Access Main Dashboard]:::successNode
    D_AUTH -- Yes --> P_DASH

    P_DASH --> D_PATH{Select Action<br/>Path?}:::decisionNode

    %% =======================
    %% TASK MARKETPLACE FLOW
    %% =======================
    D_PATH -- Task Path --> P_POST[Requester Posts Task<br/>Budget, Category, Deadline]:::processNode
    P_POST --> P_APPLY[Providers Browse & Submit<br/>Bids / Proposals]:::processNode
    P_APPLY --> D_ACCEPT{Requester Accepts<br/>Proposal?}:::decisionNode

    D_ACCEPT -- No --> P_WAIT[Wait for More Bids /<br/>Reject Proposal]:::processNode
    P_WAIT -.-> P_APPLY

    D_ACCEPT -- Yes --> P_CHAT[Open Real-Time Chat Room<br/>Requester & Provider]:::processNode
    P_CHAT --> P_TERMS[Negotiate Contract Terms<br/>Agreed Price & Duration]:::processNode
    P_TERMS --> D_AGREE{Both Parties<br/>Agree Terms?}:::decisionNode

    D_AGREE -- No (Revise) --> P_TERMS
    D_AGREE -- Yes --> P_ESCROW[Requester Deposits Funds<br/>Razorpay Escrow Locked]:::paymentNode

    P_ESCROW --> P_WORK[Task Status: IN_PROGRESS<br/>Provider Delivers Work]:::processNode
    P_WORK --> D_REVIEW{Work Approved<br/>by Requester?}:::decisionNode

    D_REVIEW -- Request Changes --> P_WORK
    D_REVIEW -- Approved --> P_PAYOUT[Release Escrow Funds<br/>to Provider Payout]:::paymentNode

    P_PAYOUT --> P_RATINGS[Both Parties Leave<br/>Rating & Review]:::processNode
    P_RATINGS --> END_TASK([Task Completed & Closed]):::endNode

    %% =======================
    %% WORKSHOPS & CLASSES FLOW
    %% =======================
    D_PATH -- Workshop Path --> D_CLASS_ROLE{Instructor or<br/>Student?}:::decisionNode

    %% Instructor Sub-flow
    D_CLASS_ROLE -- Instructor --> P_CREATE_CLASS[Create Class / Workshop<br/>Schedule, Capacity, Price]:::processNode

    %% Student Sub-flow
    D_CLASS_ROLE -- Student --> P_BROWSE_CLASS[Browse Workshop Catalog<br/>& Select Class]:::processNode
    P_BROWSE_CLASS --> D_PAID{Is Class Paid<br/>or Free?}:::decisionNode

    D_PAID -- Free --> P_FREE_ENROLL[Instant Free Registration]:::processNode
    D_PAID -- Paid --> P_CLASS_CHECKOUT[Complete Razorpay<br/>Ticket Checkout]:::paymentNode

    P_FREE_ENROLL --> P_CONFIRM_ENROLL[Enrollment Confirmed &<br/>Calendar Link Generated]:::successNode
    P_CLASS_CHECKOUT --> P_CONFIRM_ENROLL

    P_CONFIRM_ENROLL --> P_REMIND[Send Automated 2-Hour<br/>Class Reminder Alert]:::processNode
    P_CREATE_CLASS -.-> P_LIVE[Conduct / Attend Live Class<br/>via Meeting URL]:::processNode
    P_REMIND --> P_LIVE

    P_LIVE --> END_CLASS([Workshop Concluded]):::endNode

    %% =======================
    %% STYLING
    %% =======================
    classDef startNode fill:#EBFBEE,stroke:#2B8A3E,stroke-width:2px,color:#1B5E20,font-weight:bold;
    classDef endNode fill:#EBFBEE,stroke:#2B8A3E,stroke-width:2px,color:#1B5E20,font-weight:bold;
    classDef processNode fill:#E7F5FF,stroke:#1971C2,stroke-width:1.5px,color:#0C8599;
    classDef decisionNode fill:#FFF9DB,stroke:#E67700,stroke-width:1.5px,color:#D9480F,font-weight:bold;
    classDef paymentNode fill:#F3F0FF,stroke:#7048E8,stroke-width:2px,color:#5F3DC4,font-weight:bold;
    classDef successNode fill:#E6FCF5,stroke:#0CA678,stroke-width:1.5px,color:#099268,font-weight:bold;
```

---

## 2. Core Functional Stages

### 1. Identity & Onboarding
- **Firebase Auth**: New visitors register via email or Google OAuth.
- **Profile Initialization**: Defines user role, portfolio links, skill tags, and base hourly rate.

### 2. Task Marketplace & Proposal Negotiation
- **Posting**: Requesters set task title, category, budget cap, and timeline.
- **Bidding**: Providers place applications with custom pitches and quotes.
- **Negotiation**: Once accepted, parties enter a private room where `NegotiatedTerms` are adjusted and bilaterally ratified.

### 3. Escrow Security & Milestone Delivery
- **Payment Escrow**: Powered by Razorpay. Funds remain securely locked in platform escrow until work is delivered.
- **Deliverable Review**: Requester inspects completed work. Can request revisions or approve for payout.

### 4. Live Workshops & Skill Classes
- **Class Creation**: Instructors schedule live group webinars with attendee caps.
- **Enrollment**: Students register with instant seat allocation (free or paid).
- **Automated Alerts**: Automated reminders dispatched 2 hours before session time with live meeting URLs.

