# frozen_string_literal: true

# Usage
# be rake entries:migrate_to_tiptap

namespace :entries do
  desc "Migrate all plain text entries to TipTap format"
  task migrate_to_tiptap: :environment do
    puts "Starting migration of entries to TipTap format..."
    puts "=" * 60

    # Count entries that need migration
    plain_entries = Entry.where(body_format: "plain")
    total_count = plain_entries.count

    if total_count.zero?
      puts "✓ No entries to migrate. All entries are already in TipTap format."
      exit 0
    end

    puts "Found #{total_count} entries to migrate"
    puts

    # Track progress
    migrated_count = 0
    error_count = 0
    errors = []

    # Process in batches to avoid memory issues
    plain_entries.find_in_batches(batch_size: 100) do |batch|
      batch.each do |entry|
        begin
          # Decrypt the body (happens automatically via Active Record encryption)
          plain_text = entry.body

          # Convert to TipTap JSON format
          tiptap_json = convert_to_tiptap_json(plain_text)

          # Update entry with new format
          entry.update_columns(
            body: tiptap_json,
            body_format: "tiptap"
          )

          migrated_count += 1

          # Print progress every 10 entries
          if migrated_count % 10 == 0
            print "\rMigrated: #{migrated_count}/#{total_count} entries"
          end
        rescue => e
          error_count += 1
          errors << {id: entry.id, error: e.message}
          puts "\n✗ Error migrating entry #{entry.id}: #{e.message}"
        end
      end
    end

    puts "\n"
    puts "=" * 60
    puts "Migration complete!"
    puts "✓ Successfully migrated: #{migrated_count} entries"

    if error_count > 0
      puts "✗ Failed to migrate: #{error_count} entries"
      puts
      puts "Errors:"
      errors.each do |error|
        puts "  Entry #{error[:id]}: #{error[:error]}"
      end
    end

    puts "=" * 60
  end

  # Helper method to convert plain text to TipTap JSON
  def convert_to_tiptap_json(text)
    return empty_tiptap_doc if text.blank?

    # Split text into lines and convert each to a paragraph
    lines = text.split("\n")

    content = lines.map do |line|
      if line.strip.present?
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: line
            }
          ]
        }
      else
        # Empty paragraph for blank lines
        {
          type: "paragraph"
        }
      end
    end

    # Build TipTap document structure
    {
      type: "doc",
      content: content
    }.to_json
  end

  # Empty TipTap document
  def empty_tiptap_doc
    {
      type: "doc",
      content: [
        {type: "paragraph"}
      ]
    }.to_json
  end
end
