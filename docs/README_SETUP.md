# Splunk Dashboard Theme Manager - Setup & Troubleshooting

## Issues Fixed

### ✅ Modal Text Visibility
- **Problem**: White text on white background made modal unreadable
- **Solution**: Replaced CSS variables with solid colors
  - Light mode: `#0f172a` (dark text) on `#ffffff` (white background)
  - Dark mode: `#f1f5f9` (light text) on `#1e293b` (dark slate background)

### ⚠️ REST Endpoint 404 Error

The REST endpoint `/admin/apply_theme` is returning 404. This happens because:

1. **Splunk needs to be restarted** after adding new REST endpoints
2. The `restmap.conf` needs to be properly configured

#### Current Configuration

**File**: `default/restmap.conf`
```ini
[admin:apply_theme]
match=/apply_theme
members=*
python.version=python3
handlertype=python
handlerfile=apply_theme.py
handleractions=create
```

#### Verification Steps

1. **Restart Splunk**:
   ```bash
   /Applications/Splunk/bin/splunk restart
   ```

2. **Verify endpoint registration**:
   ```bash
   /Applications/Splunk/bin/splunk btool restmap list --app=dashboard_theme_manager | grep apply_theme
   ```

3. **Check logs for errors**:
   ```bash
   tail -f /Applications/Splunk/var/log/splunk/splunkd.log | grep apply_theme
   ```

4. **Test endpoint directly** (after restart):
   ```bash
   curl -k -u admin:password -X POST \
     "https://localhost:8089/servicesNS/nobody/dashboard_theme_manager/admin/apply_theme" \
     -d "dashboard=test&theme_id=dhm_dashboard_blue"
   ```

#### Alternative: Test if bin script is accessible

```bash
# Check file permissions
ls -la /Applications/Splunk/etc/apps/dashboard_theme_manager/bin/apply_theme.py

# Should show execute permissions (chmod +x was already applied)
```

## How to Apply Themes (After Fix)

1. Navigate to the Theme Manager dashboard
2. Click "Use Theme" on any theme card
3. Modal will appear with a list of your dashboards
4. Click on the dashboard you want to theme
5. Theme is automatically applied via the REST endpoint

## Technical Details

### REST Endpoint URL
```
POST /servicesNS/nobody/dashboard_theme_manager/admin/apply_theme
Parameters:
  - dashboard: name of the dashboard (without .xml)
  - theme_id: ID of the theme panel (e.g., dhm_dashboard_blue)
```

### What the Endpoint Does
1. Finds the dashboard XML file (checks `local/` then `default/`)
2. Removes any existing theme panel references
3. Adds new theme panel reference before `</form>` tag
4. Saves to `local/data/ui/views/` directory

### Debug the Endpoint

If still getting 404 after restart, check:

1. **App is enabled**:
   ```bash
   /Applications/Splunk/bin/splunk display app dashboard_theme_manager
   ```

2. **Python handler loads**:
   ```bash
   python3 /Applications/Splunk/etc/apps/dashboard_theme_manager/bin/apply_theme.py
   ```
   Should not error (it won't do anything, but shouldn't crash)

3. **Splunk recognizes the handler**:
   Check `splunkd.log` for any Python import errors related to `apply_theme.py`
