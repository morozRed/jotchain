# Lockbox configuration for encryption
#
# The master key must be a 32-byte key encoded in base64
# Generate one with: rails secret | head -c 32 | base64
#
# Example: export LOCKBOX_MASTER_KEY="YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY="

if ENV["LOCKBOX_MASTER_KEY"].present?
  # Decode base64-encoded key to binary
  master_key = Base64.decode64(ENV["LOCKBOX_MASTER_KEY"])
  Lockbox.master_key = master_key
elsif Rails.application.credentials.lockbox_master_key.present?
  Lockbox.master_key = Rails.application.credentials.lockbox_master_key
else
  # Generate a temporary key for development (DO NOT use in production!)
  if Rails.env.development?
    Rails.logger.warn "⚠️  No LOCKBOX_MASTER_KEY found. Using temporary development key."
    Rails.logger.warn "⚠️  Generate a proper key with: rails secret | head -c 32 | base64"
    # Create a proper 32-byte binary key for development
    Lockbox.master_key = "\x00" * 32
  end
end

# Configure default options
Lockbox.default_options = {
  # Use AES-GCM encryption
  algorithm: "aes-gcm",

  # Rotate encryption keys periodically (optional)
  # previous_versions: [{master_key: "old_key_here"}]
}