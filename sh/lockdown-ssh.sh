#!/bin/bash
# Disables SSH password authentication, aggressively overriding cloud-init drop-ins.

echo "Securing SSH: Disabling password authentication..."

# Ensure the script is running with root privileges
if [ "$(id -u)" -ne 0 ]; then
    echo "Error: This script must be run as root or with sudo." >&2
    exit 1
fi

# 1. The Sweep: Force 'no' in all existing config files
echo "Scrubbing existing sshd configurations..."
sed -i -E 's/^#?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config

# Check if the drop-in directory exists and contains files before running sed on it
if ls /etc/ssh/sshd_config.d/*.conf 1> /dev/null 2>&1; then
    sed -i -E 's/^#?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config.d/*.conf
fi

# 2. The Guarantee: Create a high-priority drop-in file
# Because it starts with '01', it gets parsed before '50-cloud-init.conf'
echo "Creating priority drop-in override..."
cat << 'EOF' > /etc/ssh/sshd_config.d/01-disable-passwords.conf
# This file forces password auth off, overriding cloud provider defaults
PasswordAuthentication no
PermitEmptyPasswords no
KbdInteractiveAuthentication no
EOF

# 3. The Safeguard: Test the configuration before restarting
echo "Testing SSH configuration..."
if sshd -t; then
    echo "Configuration test passed. Restarting SSH service..."
    # Distros use either 'ssh' (Ubuntu/Debian) or 'sshd' (RHEL/Fedora)
    systemctl restart ssh 2>/dev/null || systemctl restart sshd
    echo "Success! Password authentication is completely disabled."
else
    echo "Error: SSH configuration test failed. Aborting service restart to prevent lockout." >&2
    exit 1
fi