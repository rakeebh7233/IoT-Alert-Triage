# SOLUTION.md

# IoT Alert Triage — Solution Notes

## Overview

This project is a full-stack IoT alert triage platform designed to ingest, manage, filter, and triage operational alerts across multiple devices and companies.

The stack includes:

- React + TypeScript frontend
- Redux Toolkit + RTK Query
- TypeScript + Express backend
- Prisma ORM
- SQLite Database

---

# Storage Choice and Schema Reasoning

## Why SQLite

SQLite was chosen because:

- Zero configuration
- Easy and fast to get started 
- Works well with Prisma

Relational database was choosen because of the strongly related entities and structured data

---

## Schema Reasoning

- The Device entity had 1-M relationships with Alerts, Recoveries, and Sensor readings
- Device uses the Json type to store the possible multiple readingTypes and alertThreshold a device can have
- I decided to create a recoveries table rather than having it be considered an 'alert' due to clarity reasons
- Alert and AlertTriage could have been one entity but I again seperated it as much of the triage data isn't needed in the home page. They have a 1-1 relationship
- AlertTimelineEntry has a M-1 relation with an Alert
- The Users entity has a bearerToken field to handle company protected api requests

# Duplicates, Malformed Messages, and Thresholding-flagging

- Duplicates are handled by checking the database before inserting. For readings, it checks device ID, timestamp, input name, and input value. For alerts and recoveries, it checks device ID, timestamp, and alert type. If a match exists, the message is skipped.
- Malformed messages are handled with a validator using the library Zod. If validation fails, the message is logged as invalid and skipped. Messages with unknown device IDs or unsupported reading types are also skipped.
- Threshold breaches are detected for reading messages by comparing each input value against the device’s configured high and low thresholds. If the value is above the high threshold or below the low threshold, breachesThreshold is set to true, the reading is saved with that flag, and a new alert, triage record, and timeline entry are created.

# Status Transition Enforcement
- Enforcement is done both on server side and client side. On server side API calls involving transitions first verifies that the current state is valid for transitioning into the requested state. On client side this is additionally enforced by disabling/hiding of buttons based on the state

# RTK QUERY
- the /features directory has directories for the main entities: alerts, devices, users. Each directory contains the related endpoints and types.

# Source of Truth
- The server is the only source of truth. Client only reflects current cache data from the server. This presents a problem of stale data if another client is changing the DB, but this can be fixed with polling. 
- My application isn't meant to support multi clients currently and uses pessimistic updates after users perform actions that invalidate the cache.

# Tradeoffs
- I wasn't able to develop majority of the non-essential features of the project
- UI/UX is lacking and simplistic
- No proper Auth
- Validation on data could have been more thorough

# Another Week?
- Improvements on UI/UX especially with timeline
- Bulk Operations
- Analytics tab

# Additional Libraries
- Prisma: Easier to work with for Querying DB
- Zod: Useful for validation
- 

# AI Usage
- For Planning approaches and system architecture, I bounced back and forth with Claude chat and used it to help generate some of the code for the ingestion scripts and most of the API endpoints
- On the frontend I used a Gemini Flash 3.0 to generate majority of the UI/UX on pages and components. I tried using it to implement the functionality but had varying levels of success and ran out of free tokens.  
