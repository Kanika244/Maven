from investor_onboarding.schemas import ExtractedProfile

def validate_profile(profile: ExtractedProfile) -> list[str]:
    missing = []
    
    if profile.age is None:
        missing.append("age")
    if profile.annual_income is None:
        missing.append("annual_income")
    if profile.monthly_expenses is None:
        missing.append("monthly_expenses")
    if not profile.goals:
        missing.append("goals")
    if profile.investment_horizon is None:
        missing.append("investment_horizon")
    if profile.emergency_fund is None:
        missing.append("emergency_fund")
    if profile.investment_behaviour is None:
        missing.append("investment_behaviour")
    if profile.experience is None:
        missing.append("experience")
        
    return missing
