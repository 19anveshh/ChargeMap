<div align="center">

# ⚡ ChargePath

### EV Route & Charging Intelligence

**Find the smartest charging stop — not simply the nearest one.**

[![Algorithm](https://img.shields.io/badge/Algorithm-Dijkstra%20%2B%20Greedy-7455F6?style=for-the-badge)](#-decision-engine)
[![Backend](https://img.shields.io/badge/Backend-Node.js-11C5E8?style=for-the-badge)](#-tech-stack)
[![Frontend](https://img.shields.io/badge/Frontend-Vanilla%20JS-11C5E8?style=for-the-badge)](#-tech-stack)
[![Status](https://img.shields.io/badge/Status-Hackathon%20Prototype-BBF7D0?style=for-the-badge)](#-project-status)

**Distance • Battery Safety • Charging Time • Availability**

</div>

---

## 🚀 What is ChargePath?

ChargePath is an **explainable EV charging-station planner** that determines the best charging station for an electric vehicle using four practical inputs:

- 🔋 Current battery level
- 📍 Comfortable travel distance
- ⚡ Preferred charging time
- 🟢 Station availability

Instead of simply selecting the nearest charging station, ChargePath first determines which stations are **safe and feasible**, then evaluates the remaining candidates using a weighted multi-criteria scoring model.

The result is:

> **A safe, explainable charging recommendation with the route, score, and reasoning behind the decision.**

---

## 🎯 Problem

Choosing an EV charging station is not a simple nearest-location problem.

A station may be:

- Too far for the current battery level
- Outside the driver's comfortable travel distance
- Currently unavailable
- Too slow for the driver's charging preference
- Slightly farther but significantly better overall

ChargePath addresses this as a **constrained decision and shortest-path problem**.

---

## 💡 Core Idea

The system separates the problem into two stages:

### 1. Feasibility

Determine which stations the EV can realistically reach.

### 2. Optimization

Compare feasible stations across multiple criteria and select the highest-scoring option.

This prevents an unreachable station from winning simply because it performs well in another category.

---

# 🧠 Decision Engine

```text
EV Location + Battery Level
             │
             ▼
      Dijkstra Algorithm
             │
             ▼
   Calculate Shortest Routes
             │
             ▼
    Battery Feasibility Gate
             │
             ▼
    Availability Filtering
             │
             ▼
   Multi-Criteria Scoring
             │
             ▼
       Greedy Selection
             │
             ▼
      Best Charging Station
             │
             ▼
 Route + Distance + Score + Explanation
