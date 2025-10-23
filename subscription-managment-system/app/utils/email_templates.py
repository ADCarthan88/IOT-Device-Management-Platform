def expiry_warning_template(plan_name: str, days_left: int) -> str:
    return (
        f"Dear Subscriber, \n\n"
        f"Your {plan_name} subscription will expire in {days_left} days.\n"
        f"Please renew your subscription to continue enjoying our services.\n\n"
        f"Thank you!"
    )

def expiry_notification_template(plan_name: str) -> str:
    return (
        f"Dear Scubscriber,\n\n"
        f"Your {plan_name} subscription has expired.\n"
        f"Please renew your subscription to restore access to our services.\n\n"
        f"Thank you!"
    )