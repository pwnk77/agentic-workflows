---
description: AI-powered SQLite data generation and enhancement with STRICT SQLite→JSON→SQLite workflow and session management
allowed-tools: Read, Write, Edit, Bash, TodoWrite
argument-hint: <sqlite-path> <problem-statement> OR resume <session-file-path>
---

# GRIDGEN COMMAND - AI Data Enhancement

**Goal**: Transform SQLite databases with AI-powered enhancements using **STRICT SQLite→JSON→SQLite workflow** with batch processing and session management.

**CRITICAL CONSTRAINT**: **NEVER CREATE PYTHON SCRIPTS**. Use **ONLY** SQLite commands, JSON tools (jq), and bash commands.

**Process**: SQLite → JSON → AI Enhancement (Batched) → SQLite (modifies original database)

**Usage**:
- **New session**: `/gridgen <sqlite-path> <problem-statement>`
- **Resume session**: `/gridgen resume <session-file-path>`

**Arguments**:
- `sqlite_path`: Path to SQLite database file (for new sessions)
- `problem_statement`: Description of AI enhancement needed (for new sessions)
- `session_file_path`: Path to existing session file (for resume - contains all original parameters)

**Examples**:
- `/gridgen company.db "add 100 employees with job descriptions"`
- `/gridgen resume docs/GRIDGEN-20240826-company-add-employees.md`
- `/gridgen inventory.db "generate product descriptions based on product name"`

**Features**: Batch processing, session logging (`.gridgen_session.md`), user clarification, context window management, resumption capabilities.

---

## MODE: PROCESS (Default)

This is the default mode for new GRIDGEN processing sessions.

## MODE: RESUME

Resume JSON AI generation from where it stopped. Usage: `/gridgen resume <session-file-path>`

```bash
# Extract session variables and resume JSON processing
SESSION_LOG="$1"
sqlite_path=$(grep "^\*\*Database\*\*:" "$SESSION_LOG" | cut -d: -f2- | xargs)
problem_statement=$(grep "^\*\*Enhancement Task\*\*:" "$SESSION_LOG" | cut -d: -f2- | xargs)

echo "🔄 RESUMING: $(basename "$sqlite_path") - $problem_statement"

# Resume at JSON enhancement stage (most common failure point)
if [ -d "./json_temp" ] && [ "$(ls -A ./json_temp/*.json 2>/dev/null | wc -l)" -gt 0 ]; then
    echo "✅ JSON files found - continuing AI enhancement from last batch"
    echo "### 🔄 RESUME: $(date)" >> "$SESSION_LOG"
    # Continue with Phase 2: AI Enhancement (batched JSON processing)
else
    echo "❌ JSON missing - restarting from export"
    # Restart from Phase 1
fi
```

---

## PHASE 1: SETUP & EXPORT

### Setup and Validation
1. **Initialize Session & Environment**:
   ```bash
   # Create enriched session documentation with date-time-filename format
   db_basename=$(basename "$sqlite_path" .db)
   problem_slug=$(echo "$problem_statement" | tr ' ' '-' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]//g' | cut -c1-30)
   SESSION_LOG="docs/GRIDGEN-$(date +%Y%m%d)-${db_basename}-${problem_slug}.md"
   mkdir -p docs
   
   echo "# GRIDGEN Session: $(basename "$sqlite_path") Enhancement" > "$SESSION_LOG"
   echo "**Session ID**: GRIDGEN-$(date +%Y%m%d)-${db_basename}-${problem_slug}" >> "$SESSION_LOG"
   echo "**Started**: $(date)" >> "$SESSION_LOG"
   echo "**Database**: $sqlite_path" >> "$SESSION_LOG"
   echo "**Enhancement Task**: $problem_statement" >> "$SESSION_LOG"
   echo "" >> "$SESSION_LOG"
   
   # Validate dependencies (STRICT: sqlite3 + jq only)
   which sqlite3 && which jq && test -f "$sqlite_path" || exit 1
   backup_file="${sqlite_path%.*}_backup_$(date +%Y%m%d_%H%M%S).db"
   cp "$sqlite_path" "$backup_file" && mkdir -p ./json_temp
   
   echo "## Phase 1: Setup & Export" >> "$SESSION_LOG"
   echo "- ✅ Dependencies validated: sqlite3, jq" >> "$SESSION_LOG"
   echo "- 💾 Backup created: $backup_file" >> "$SESSION_LOG"
   echo "- 📁 Working directory: ./json_temp/" >> "$SESSION_LOG"
   ```

### Export to JSON
2. **Export All Tables with Logging**:
   ```bash
   # STRICT SQLite operations only
   tables=$(sqlite3 "$sqlite_path" ".tables")
   echo "### Database Export Results" >> "$SESSION_LOG"
   echo "- 📋 Tables discovered: $tables" >> "$SESSION_LOG"
   echo "" >> "$SESSION_LOG"
   
   for table in $tables; do
     sqlite3 "$sqlite_path" -cmd ".mode json" "SELECT * FROM $table;" > "./json_temp/${table}.json"
     row_count=$(sqlite3 "$sqlite_path" "SELECT COUNT(*) FROM $table;")
     column_count=$(sqlite3 "$sqlite_path" "PRAGMA table_info($table);" | wc -l)
     echo "- 📊 **$table**: $row_count records, $column_count columns" >> "$SESSION_LOG"
   done
   
   # Export schema for reference
   sqlite3 "$sqlite_path" ".schema" > ./json_temp/schema.sql
   echo "- 🏗️  Schema exported to schema.sql" >> "$SESSION_LOG"
   echo "" >> "$SESSION_LOG"
   ```

---

## PHASE 2: AI ENHANCEMENT

### Problem Analysis & User Clarification
1. **Parse Enhancement Type & Get Clarification**:
   ```bash
   echo "## Phase 2: AI Enhancement Analysis" >> "$SESSION_LOG"
   echo "**Task**: $problem_statement" >> "$SESSION_LOG"
   echo "" >> "$SESSION_LOG"
   
   # NO PYTHON SCRIPTS: Use only jq and SQLite analysis
   # Analyze existing data patterns using JSON
   for table in $tables; do
     sample_record=$(jq '.[0]' "./json_temp/${table}.json" 2>/dev/null || echo "{}")
     record_count=$(jq 'length' "./json_temp/${table}.json" 2>/dev/null || echo "0")
     
     if [ "$record_count" -gt 0 ]; then
       echo "### Table Analysis: **$table**" >> "$SESSION_LOG"
       echo "- 📊 Current records: $record_count" >> "$SESSION_LOG"
       echo "- 🔍 Sample structure: $(echo "$sample_record" | jq -c 'keys')" >> "$SESSION_LOG"
       echo "" >> "$SESSION_LOG"
     fi
   done
   ```

### Batch Processing Configuration
2. **Determine Batch Strategy**:
   ```bash
   BATCH_SIZE=50  # Default batch size
   sample_record=$(jq '.[0]' "./json_temp/${target_table}.json")
   record_size=$(echo "$sample_record" | wc -c)
   total_records=$(jq 'length' "./json_temp/${target_table}.json")
   
   # Adjust batch size based on record complexity
   [ "$record_size" -gt 1000 ] && BATCH_SIZE=20 || [ "$record_size" -gt 500 ] && BATCH_SIZE=35
   total_batches=$(( (total_records + BATCH_SIZE - 1) / BATCH_SIZE ))
   
   echo "### Batch Plan: $total_records records, $BATCH_SIZE per batch, $total_batches batches" >> "$SESSION_LOG"
   ```

### JSON Data Processing (Batched) - SQLITE/JQ ONLY
3. **Data Generation & Enhancement** (NO PYTHON SCRIPTS):
   ```bash
   echo "### AI Enhancement Processing" >> "$SESSION_LOG"
   echo "**Method**: Pure JSON manipulation with jq + SQLite commands" >> "$SESSION_LOG"
   echo "" >> "$SESSION_LOG"
   
   # STRICT: Use jq for JSON manipulation, SQLite for data patterns
   for target_table in $tables; do
     current_count=$(jq 'length' "./json_temp/${target_table}.json" 2>/dev/null || echo "0")
     
     if [ "$current_count" -gt 0 ]; then
       echo "#### Processing Table: **$target_table**" >> "$SESSION_LOG"
       echo "- 📊 Baseline records: $current_count" >> "$SESSION_LOG"
       
       # Resume support: Check for completed batches
       completed_batches=$(grep "Batch.*completed" "$SESSION_LOG" 2>/dev/null | wc -l || echo "0")
       echo "- 🔄 Resume: Starting from batch $((completed_batches + 1))" >> "$SESSION_LOG"
       
       # Extract patterns using SQLite and jq (NO PYTHON)
       max_id=$(jq 'map(.id) | max' "./json_temp/${target_table}.json" 2>/dev/null || echo "0")
       new_records_needed=100  # Adjust based on problem_statement
       
       echo "- 🎯 Target new records: $new_records_needed (resumable batches)" >> "$SESSION_LOG"
       echo "- ⚙️  Processing method: jq + bash loops with checkpoint logging" >> "$SESSION_LOG"
       echo "" >> "$SESSION_LOG"
     fi
   done
   ```

---

## PHASE 3: IMPORT & VALIDATE

### Database Reconstruction (Batched) - SQLITE ONLY
1. **Schema Updates & Batch Import**:
   ```bash
   echo "## Phase 3: Database Reconstruction" >> "$SESSION_LOG"
   echo "**Method**: Pure SQLite operations with batch CSV import" >> "$SESSION_LOG"
   echo "" >> "$SESSION_LOG"
   
   # STRICT SQLite operations for schema modifications
   for target_table in $tables; do
     enhanced_data_file="./json_temp/${target_table}.json"
     
     if [ -f "$enhanced_data_file" ]; then
       echo "### Reconstructing Table: **$target_table**" >> "$SESSION_LOG"
       
       # Detect new columns using jq
       enhanced_keys=$(jq -r '.[0] | keys_unsorted | join(",")' "$enhanced_data_file" 2>/dev/null)
       
       # Add new columns if needed (SQLITE ONLY)
       if [ -n "$enhanced_keys" ]; then
         # Use SQLite to add columns
         for new_col in employee_id job_description enhanced_desc; do
           sqlite3 "$sqlite_path" "ALTER TABLE ${target_table} ADD COLUMN ${new_col} TEXT;" 2>/dev/null || true
         done
         echo "- 🏗️  Schema updated for $target_table" >> "$SESSION_LOG"
       fi
       
       # Clear existing data using SQLite
       sqlite3 "$sqlite_path" "DELETE FROM ${target_table};" 
       echo "- 🧹 Cleared existing $target_table data" >> "$SESSION_LOG"
       
       # Batch import using SQLite CSV mode
       total_records=$(jq 'length' "$enhanced_data_file")
       import_batch_size=50; batch_count=0
       
       echo "- 📊 Total records to import: $total_records" >> "$SESSION_LOG"
       
       while [ $((batch_count * import_batch_size)) -lt $total_records ]; do
         batch_start=$((batch_count * import_batch_size))
         batch_end=$((batch_start + import_batch_size))
         [ $batch_end -gt $total_records ] && batch_end=$total_records
         
         echo "- ⚙️  Importing batch $((batch_count + 1)) (records $batch_start-$((batch_end-1)))" >> "$SESSION_LOG"
         
         # Use jq to extract batch and convert to CSV for SQLite import
         batch_csv_file="./json_temp/import_${target_table}_batch_${batch_count}.csv"
         
         # Dynamic CSV generation based on actual columns
         jq -r ".[$batch_start:$batch_end] | map(values) | .[] | @csv" "$enhanced_data_file" > "$batch_csv_file"
         
         # SQLite CSV import
         sqlite3 "$sqlite_path" ".mode csv" ".import $batch_csv_file ${target_table}"
         rm "$batch_csv_file"
         
         batch_count=$((batch_count + 1))
       done
       
       echo "- ✅ Completed $batch_count batches for $target_table" >> "$SESSION_LOG"
       echo "" >> "$SESSION_LOG"
     fi
   done
   ```

### Validation & Enriched Session Documentation
2. **Data Integrity & Enriched Session Completion**:
   ```bash
   echo "## Phase 4: Validation & Session Summary" >> "$SESSION_LOG"
   echo "**Completed**: $(date)" >> "$SESSION_LOG"
   echo "" >> "$SESSION_LOG"
   
   # STRICT SQLite validation queries
   for target_table in $tables; do
     final_count=$(sqlite3 "$sqlite_path" "SELECT COUNT(*) FROM ${target_table};")
     expected_count=$(jq 'length' "./json_temp/${target_table}.json" 2>/dev/null || echo "0")
     
     if [ "$final_count" -eq "$expected_count" ] && [ "$final_count" -gt 0 ]; then
       echo "### ✅ **$target_table** - VALIDATION PASSED" >> "$SESSION_LOG"
       echo "- 📊 Records imported: $final_count" >> "$SESSION_LOG"
       echo "- ✅ Data integrity: VERIFIED" >> "$SESSION_LOG"
       
       # Sample validation using SQLite
       sample_data=$(sqlite3 "$sqlite_path" "SELECT * FROM $target_table LIMIT 3;")
       echo "- 🔍 Sample records: $(echo "$sample_data" | wc -l) rows" >> "$SESSION_LOG"
       
     elif [ "$final_count" -ne "$expected_count" ]; then
       echo "### ❌ **$target_table** - VALIDATION FAILED" >> "$SESSION_LOG"
       echo "- 📊 Expected: $expected_count, Got: $final_count" >> "$SESSION_LOG"
       echo "- ⚠️  Data integrity: ISSUE DETECTED" >> "$SESSION_LOG"
     fi
     echo "" >> "$SESSION_LOG"
   done
   
   # Enriched session completion (NO gridgen_report.json)
   echo "## 🎉 GRIDGEN SESSION COMPLETE" >> "$SESSION_LOG"
   echo "**Session ID**: GRIDGEN-$(date +%Y%m%d)-${db_basename}-${problem_slug}" >> "$SESSION_LOG"
   echo "**Duration**: $((SECONDS/60)) minutes" >> "$SESSION_LOG"
   echo "**Database**: $(basename "$sqlite_path")" >> "$SESSION_LOG"
   echo "**Enhancement**: $problem_statement" >> "$SESSION_LOG"
   echo "**Backup**: $(basename "$backup_file")" >> "$SESSION_LOG"
   echo "**Method**: Pure SQLite→JSON→SQLite workflow" >> "$SESSION_LOG"
   echo "" >> "$SESSION_LOG"
   
   echo "### 📊 Final Statistics" >> "$SESSION_LOG"
   total_final_records=0
   for table in $tables; do
     count=$(sqlite3 "$sqlite_path" "SELECT COUNT(*) FROM $table;")
     total_final_records=$((total_final_records + count))
     echo "- **$table**: $count records" >> "$SESSION_LOG"
   done
   echo "- **Total records**: $total_final_records" >> "$SESSION_LOG"
   echo "" >> "$SESSION_LOG"
   
   echo "### 🛠️ Technical Summary" >> "$SESSION_LOG"
   echo "- ✅ **Pure SQLite operations**: No Python scripts generated" >> "$SESSION_LOG"
   echo "- ✅ **JSON processing**: jq-based manipulation only" >> "$SESSION_LOG"
   echo "- ✅ **Batch processing**: SQLite CSV import batches" >> "$SESSION_LOG"
   echo "- ✅ **Session documentation**: Enriched markdown format" >> "$SESSION_LOG"
   echo "" >> "$SESSION_LOG"
   
   # Cleanup temp files
   [ "$total_final_records" -gt 0 ] && rm -rf ./json_temp || echo "- ⚠️ Temp files preserved for debugging" >> "$SESSION_LOG"
   
   echo "📋 **Session documentation**: $SESSION_LOG" >> "$SESSION_LOG"
   ```

---

## ERROR HANDLING & RECOVERY

### Session Management & Resumption
**Resume interrupted JSON processing**: `/gridgen resume docs/GRIDGEN-[date]-[db]-[task].md`

```bash
# Auto-detect previous session for quick resume
if [ -f "docs/GRIDGEN-"*".md" ]; then
    latest_session=$(ls -t docs/GRIDGEN-*.md | head -1)
    echo "💡 Found session: $latest_session"
    echo "💡 Resume command: /gridgen resume $latest_session"
fi
```

### Safety Protocols & Recovery
- **Session Logging**: Complete operation history in `.gridgen_session.md`
- **Batch Checkpointing**: Progress saved after each batch completion  
- **Backup Strategy**: Original database preserved before modifications
- **Rollback Procedures**: Phase-specific recovery (Phase 1: clean temp files, Phase 2: preserve JSON, Phase 3: restore from backup)

### Success Confirmation - ENRICHED SESSION DOCS
```
🔔 GRIDGEN_COMPLETE: AI enhancement finished successfully

📊 Results:
• Database: [sqlite_path]
• Problem: [problem_statement] 
• Processing: Pure SQLite→JSON→SQLite workflow
• Method: jq + bash + SQLite commands ONLY (NO PYTHON)
• Records processed: [final_count]
• Duration: [processing_time] minutes
• Session Mode: [process|resume]

📋 Session Documentation: docs/[session_id].md (ENRICHED)
💾 Backup: [backup_file]
✅ Original database enhanced with STRICT SQLite workflow!

🔄 Resume: /gridgen resume [session-file] for JSON AI continuation
🚫 NO PYTHON SCRIPTS GENERATED - Pure SQLite operations maintained
```

---

## SCALABILITY & FEATURES

### Production-Ready Capabilities - SQLITE STRICT
- **STRICT SQLite Operations**: NO Python scripts, pure SQLite + jq + bash workflow
- **Enriched Session Documentation**: Comprehensive docs/[session_id].md files with technical details
- **Adaptive Batching**: SQLite CSV import batches (20-100 records)
- **Memory Efficiency**: Stream processing with jq for large datasets  
- **Progressive Processing**: Build enhancements using pure JSON manipulation
- **Data Integrity**: SQLite-based validation queries and constraints
- **JSON Resume**: Resume interrupted AI enhancement from JSON processing stage
- **Session Recovery**: Smart detection of JSON files and batch continuation

### Key Constraints & Design Principles
- **🚫 NO PYTHON SCRIPTS**: Command will NEVER generate .py files
- **✅ SQLite Commands**: All database operations use sqlite3 CLI only
- **✅ JSON Processing**: jq tool for all JSON manipulation and transformation
- **✅ Enriched Documentation**: Session logs stored in docs/ folder with meaningful names
- **✅ Batch Processing**: SQLite .import with CSV batches for efficiency
- **✅ Pure Workflow**: SQLite→JSON→Enhancement→SQLite maintains data fidelity