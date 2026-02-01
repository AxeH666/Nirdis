import re
import sys
from collections import defaultdict

ERROR_PATTERNS = {
    "POSTGRES_PERMISSION": [
        r"permission denied for table (\w+)",
        r"permission denied to create database",
    ],
    "PRISMA_MISSING_TABLE": [
        r"The table `public\.(\w+)` does not exist",
    ],
    "AUTH_CSRF": [
        r"MissingCSRF",
    ],
    "OAUTH_CONFIG": [
        r"error=Configuration",
        r"UnknownAction",
        r"Invalid URL",
    ],
    "ADAPTER_ERROR": [
        r"AdapterError",
        r"DriverAdapterError",
    ],
}

def classify_line(line):
    for category, patterns in ERROR_PATTERNS.items():
        for pattern in patterns:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                detail = match.group(1) if match.groups() else line.strip()
                return category, detail
    return None, None

def extract_issues(log_lines):
    issues = defaultdict(set)

    for line in log_lines:
        category, detail = classify_line(line)
        if category:
            issues[category].add(detail)

    return issues

def print_report(issues):
    print("\n====== AUTH / DB ISSUE REPORT ======\n")

    if not issues:
        print("✅ No issues detected.")
        return

    for category, details in issues.items():
        print(f"🔴 {category}")
        for d in details:
            print(f"   - {d}")
        print()

    print("====== ACTION SUMMARY ======\n")

    if "POSTGRES_PERMISSION" in issues:
        print("• GRANT privileges on all auth + app tables to DB user")

    if "PRISMA_MISSING_TABLE" in issues:
        print("• Run Prisma migration / db push as privileged user")

    if "AUTH_CSRF" in issues:
        print("• Ensure cookies + CSRF handling (already resolved earlier)")

    if "OAUTH_CONFIG" in issues:
        print("• Verify AUTH_URL, redirect URIs, provider setup")

    if "ADAPTER_ERROR" in issues:
        print("• Adapter errors are SYMPTOMS — fix DB schema / permissions")

    print("\n===================================\n")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        with open(sys.argv[1], "r") as f:
            lines = f.readlines()
    else:
        lines = sys.stdin.readlines()

    issues = extract_issues(lines)
    print_report(issues)
