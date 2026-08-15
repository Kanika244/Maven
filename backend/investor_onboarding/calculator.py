def calculate_metrics(profile) -> dict:
    metrics = {}
    
    income_monthly = (profile.annual_income or 0) / 12
    expenses = profile.monthly_expenses or 0
    
    # Savings Rate
    if income_monthly > 0:
        savings_rate = ((income_monthly - expenses) / income_monthly) * 100
    else:
        savings_rate = 0.0
    metrics["savings_rate"] = savings_rate
    
    # Monthly Investment Capacity
    metrics["monthly_investment_capacity"] = max(0, income_monthly - expenses)
    
    # Debt Ratio
    if profile.annual_income and profile.annual_income > 0:
        metrics["debt_to_income"] = (profile.debt or 0) / profile.annual_income
    else:
        metrics["debt_to_income"] = 0
        
    # Emergency Fund Ratio
    if expenses > 0:
        metrics["emergency_fund_months"] = (profile.emergency_fund or 0) / expenses
    else:
        metrics["emergency_fund_months"] = 0
        
    return metrics
