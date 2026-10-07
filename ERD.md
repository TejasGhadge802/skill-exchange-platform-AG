# Database Architecture: Conceptual, Logical & Physical ERD

This document replicates the 3-tier database architecture design with exact visual notations:
1. **CONCEPTUAL ERD (High-Level View)** — Chen's notation (Green entity boxes, Blue relationship diamonds, Cardinalities `1` & `N`).
2. **LOGICAL ERD (Detailed Logical View)** — Chen's notation with Entity Attributes in ovals, underlined Primary Keys, and relationship attributes.
3. **PHYSICAL ERD (Database-Level Implementation)** — Relational tables with Purple headers, `PK`, `FK`, SQL Data Types, and Crow's Foot relationships.

> 💡 **Excalidraw Visual Canvas**: A visual interactive `.excalidraw` version matching the reference image has been generated in [`.excalidraw`](file:///.excalidraw). Open it in VS Code to view or edit the canvas diagram directly!

---

## 1. CONCEPTUAL ERD (High-Level View)

In the Conceptual Model:
- **Entities** are represented by **Green rectangular boxes** (`USER`, `TASK`, `APPLICATION`, `CATEGORY`, `PAYMENT`).
- **Relationships** are represented by **Blue diamond shapes** (`Places`, `Contains`, `Belongs to`, `Has Payment`).
- **Cardinalities** (`1`, `N`) define the degree of association without implementation clutter.

```mermaid
flowchart LR
    %% Conceptual Flow
    USER["USER"]:::entity ---|1| R_PLACES{"Places"}:::rel ---|N| TASK["TASK"]:::entity
    TASK ---|1| R_CONTAINS{"Contains"}:::rel ---|N| APPLICATION["APPLICATION"]:::entity
    APPLICATION ---|N| R_BELONGS{"Belongs to"}:::rel ---|1| CATEGORY["CATEGORY"]:::entity

    TASK ---|1| R_PAYMENT{"Has<br/>Payment"}:::rel ---|1| PAYMENT["PAYMENT"]:::entity

    %% Styles matching reference image
    classDef entity fill:#EBFBEE,stroke:#2B8A3E,stroke-width:2px,color:#1B5E20,font-weight:bold;
    classDef rel fill:#FFFFFF,stroke:#1864AB,stroke-width:2px,color:#0D47A1,font-weight:bold;
```

---

## 2. LOGICAL ERD (Detailed Logical View)

In the Logical Model:
- **Attributes** are represented in **Ovals / Ellipses** linked to their respective entities.
- **Primary Keys** are highlighted with an underline (`<u>PK</u>`).
- **Relationship Attributes** (e.g., `ProposedDays`) are connected with dashed lines to the relationship diamond.
- Domain attributes, business constraints, and foreign key connections are fully defined.

```mermaid
flowchart LR
    %% User and Attributes
    U_PK(["<u>UserID (PK)</u>"]):::pkAttr --- USER["USER"]:::entity
    U_NAME(["Name"]):::attr --- USER
    U_EMAIL(["Email"]):::attr --- USER
    U_ROLE(["Role"]):::attr --- USER
    U_RATE(["HourlyRate"]):::attr --- USER

    %% Relationship Places
    USER ---|1| R_PLACES{"Places"}:::rel ---|N| TASK["TASK"]:::entity

    %% Task and Attributes
    T_PK(["<u>TaskID (PK)</u>"]):::pkAttr --- TASK
    T_TITLE(["Title"]):::attr --- TASK
    T_BUDGET(["BudgetMax"]):::attr --- TASK
    T_STATUS(["Status"]):::attr --- TASK
    T_DEADLINE(["Deadline"]):::attr --- TASK

    %% Has Payment & Payment Attributes
    TASK ---|1| R_PAYMENT{"Has<br/>Payment"}:::rel ---|1| PAYMENT["PAYMENT"]:::entity
    P_PK(["<u>PaymentID (PK)</u>"]):::pkAttr --- PAYMENT
    P_DATE(["PaymentDate"]):::attr --- PAYMENT
    P_AMOUNT(["Amount"]):::attr --- PAYMENT
    P_METHOD(["PaymentMethod"]):::attr --- PAYMENT
    P_STATUS(["Status"]):::attr --- PAYMENT

    %% Contains & Relationship Attribute
    TASK ---|1| R_CONTAINS{"Contains"}:::rel ---|N| APPLICATION["APPLICATION"]:::entity
    R_CONTAINS -.- REL_DAYS(["ProposedDays"]):::relAttr

    %% Application and Attributes
    A_PK(["<u>ApplicationID (PK)</u>"]):::pkAttr --- APPLICATION
    A_PITCH(["Pitch"]):::attr --- APPLICATION
    A_PRICE(["ProposedPrice"]):::attr --- APPLICATION
    A_STATUS(["Status"]):::attr --- APPLICATION

    %% Belongs to & Category Attributes
    APPLICATION ---|N| R_BELONGS{"Belongs to"}:::rel ---|1| CATEGORY["CATEGORY"]:::entity
    C_PK(["<u>CategoryID (PK)</u>"]):::pkAttr --- CATEGORY
    C_NAME(["CategoryName"]):::attr --- CATEGORY
    C_DESC(["Description"]):::attr --- CATEGORY

    %% Styles matching reference image
    classDef entity fill:#EBFBEE,stroke:#2B8A3E,stroke-width:2px,color:#1B5E20,font-weight:bold;
    classDef rel fill:#FFFFFF,stroke:#1864AB,stroke-width:2px,color:#0D47A1,font-weight:bold;
    classDef attr fill:#FFFFFF,stroke:#495057,stroke-width:1.5px,color:#212529;
    classDef pkAttr fill:#F4FCE3,stroke:#2B8A3E,stroke-width:2px,color:#2B8A3E,font-weight:bold;
    classDef relAttr fill:#FFFFFF,stroke:#868E96,stroke-width:1.5px,stroke-dasharray: 4 4,color:#495057;
```

---

## 3. PHYSICAL ERD (Database-Level Implementation)

In the Physical Model:
- Entities are represented as **Relational Tables** with **Purple Headers**.
- Columns denote Key constraints (`PK`, `FK`), Field Names, and **Data Types** (`UUID`, `VARCHAR`, `DECIMAL`, `INT`, `DATETIME`).
- Relationships use **Crow's Foot notation** to denote exact cardinality and foreign key relationships.

```mermaid
erDiagram
    USERS ||--o{ TASKS : "1 : N"
    TASKS ||--|| PAYMENTS : "1 : 1"
    TASKS ||--o{ APPLICATIONS : "1 : N"
    CATEGORIES ||--o{ TASKS : "1 : N"
    USERS ||--o{ APPLICATIONS : "1 : N"

    USERS {
        UUID UserID PK
        VARCHAR DisplayName "VARCHAR(100)"
        VARCHAR Email "VARCHAR(100)"
        VARCHAR Role "VARCHAR(20)"
        DECIMAL HourlyRate "DECIMAL(10,2)"
        DECIMAL RatingAvg "DECIMAL(3,2)"
    }

    TASKS {
        UUID TaskID PK
        UUID RequesterID FK "USERS.UserID"
        UUID CategoryID FK "CATEGORIES.CategoryID"
        VARCHAR Title "VARCHAR(150)"
        DECIMAL BudgetMax "DECIMAL(10,2)"
        VARCHAR Status "VARCHAR(20)"
        DATETIME Deadline "DATETIME"
    }

    PAYMENTS {
        UUID PaymentID PK
        UUID TaskID FK "TASKS.TaskID"
        UUID PayerID FK "USERS.UserID"
        DATETIME PaymentDate "DATETIME"
        DECIMAL Amount "DECIMAL(10,2)"
        VARCHAR PaymentMethod "VARCHAR(50)"
        VARCHAR Status "VARCHAR(20)"
    }

    APPLICATIONS {
        UUID ApplicationID PK
        UUID TaskID FK "TASKS.TaskID"
        UUID ProviderID FK "USERS.UserID"
        DECIMAL ProposedPrice "DECIMAL(10,2)"
        INT DurationDays "INT"
        VARCHAR Status "VARCHAR(20)"
    }

    CATEGORIES {
        UUID CategoryID PK
        VARCHAR CategoryName "VARCHAR(100)"
        VARCHAR Description "VARCHAR(255)"
    }
```

### Physical Schema Tables (Relational Layout)

| Table | Column | Key | Data Type | Nullable | Description |
|---|---|---|---|---|---|
| **USERS** | `UserID` | **PK** | `UUID` | No | Unique identifier for user |
| | `DisplayName` | | `VARCHAR(100)` | No | User full name |
| | `Email` | | `VARCHAR(100)` | No | Unique account email |
| | `Role` | | `VARCHAR(20)` | No | Role (requester, provider, admin) |
| | `HourlyRate` | | `DECIMAL(10,2)` | Yes | Base hourly service rate |
| | `RatingAvg` | | `DECIMAL(3,2)` | Yes | Average feedback score |
| **TASKS** | `TaskID` | **PK** | `UUID` | No | Unique identifier for task |
| | `RequesterID` | **FK** | `UUID` | No | References `USERS(UserID)` |
| | `CategoryID` | **FK** | `UUID` | Yes | References `CATEGORIES(CategoryID)` |
| | `Title` | | `VARCHAR(150)` | No | Task headline |
| | `BudgetMax` | | `DECIMAL(10,2)` | No | Budget ceiling |
| | `Status` | | `VARCHAR(20)` | No | `open`, `in_progress`, `completed` |
| | `Deadline` | | `DATETIME` | Yes | Target delivery date |
| **PAYMENTS** | `PaymentID` | **PK** | `UUID` | No | Unique payment record |
| | `TaskID` | **FK** | `UUID` | No | References `TASKS(TaskID)` |
| | `PayerID` | **FK** | `UUID` | No | References `USERS(UserID)` |
| | `PaymentDate` | | `DATETIME` | No | Timestamp of transaction |
| | `Amount` | | `DECIMAL(10,2)` | No | Escrow amount |
| | `PaymentMethod`| | `VARCHAR(50)` | No | Razorpay, Card, UPI |
| | `Status` | | `VARCHAR(20)` | No | `authorized`, `captured`, `refunded` |
| **APPLICATIONS** | `ApplicationID`| **PK** | `UUID` | No | Proposal identifier |
| | `TaskID` | **FK** | `UUID` | No | References `TASKS(TaskID)` |
| | `ProviderID` | **FK** | `UUID` | No | References `USERS(UserID)` |
| | `ProposedPrice`| | `DECIMAL(10,2)` | No | Quoted bid price |
| | `DurationDays` | | `INT` | No | Estimated turnaround |
| | `Status` | | `VARCHAR(20)` | No | `pending`, `accepted`, `rejected` |
| **CATEGORIES** | `CategoryID` | **PK** | `UUID` | No | Category identifier |
| | `CategoryName`| | `VARCHAR(100)` | No | Domain name (Web, Mobile, AI) |
| | `Description` | | `VARCHAR(255)` | Yes | Scope of category |

