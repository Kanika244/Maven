def calculate_risk_score(profile, metrics) -> tuple[float, str]:
    score = 50.0 # Base score

    # Age factor: Younger -> higher risk tolerance
    if profile.age:
        if profile.age < 30:
            score += 15
        elif profile.age < 45:
            score += 5
        elif profile.age > 60:
            score -= 15
            
    # Savings rate factor
    if metrics.get("savings_rate", 0) > 30:
        score += 10
    elif metrics.get("savings_rate", 0) < 10:
        score -= 10
        
    # Emergency fund factor
    if metrics.get("emergency_fund_months", 0) >= 6:
        score += 10
    elif metrics.get("emergency_fund_months", 0) < 3:
        score -= 10
        
    # Behaviour
    beh = str(profile.investment_behaviour).lower()
    if "buy" in beh or "opportunity" in beh:
        score += 15
    elif "sell" in beh or "panic" in beh:
        score -= 20
        
    # clamp
    score = max(0.0, min(100.0, score))
    
    if score < 35:
        category = "Conservative"
    elif score < 70:
        category = "Moderate"
    else:
        category = "Aggressive"
        
    return score, category
