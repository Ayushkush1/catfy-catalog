# Plan Sharing Feature - User Guide

## Overview
The Plan Sharing feature allows catalogue owners with premium subscriptions (Standard, Professional, or Business plans) to share their premium benefits with team members for specific catalogues.

## For Catalogue Owners

### Enabling Plan Sharing

1. **Navigate to Team Tab**
   - Open your catalogue in edit mode
   - Click on the "Team" tab in the left sidebar

2. **Locate Plan Sharing Card**
   - If you have a premium plan (not FREE), you'll see a blue gradient "Plan Sharing" card at the top
   - This card displays:
     - Current sharing status (Enabled/Disabled)
     - Toggle button to enable/disable
     - List of benefits being shared (AI Features, Premium Export, Premium Templates)
     - Important note about catalogue-specific sharing

3. **Enable Sharing**
   - Click the "Enable Plan Sharing" button
   - The status will update to "Enabled ✓"
   - An activity log entry will be created
   - All team members will now have access to premium features for this catalogue

4. **Disable Sharing**
   - Click the "Disable Plan Sharing" button to revoke access
   - Team members will lose premium access (but can still edit based on their permissions)

### What Gets Shared?

When plan sharing is enabled, team members get access to:
- ✨ **AI Features**: AI-powered product descriptions and content generation
- 📄 **Premium Export**: Advanced PDF export options
- 🎨 **Premium Templates**: Access to all premium catalogue themes

### Important Notes

- Plan sharing is **catalogue-specific** - team members only get premium access for catalogues where sharing is enabled
- Team members need their own premium plan for catalogues they own
- You can enable/disable sharing at any time
- Activity logs track all plan sharing changes

## For Team Members

### How to Know You Have Premium Access

When the owner enables plan sharing for you, you'll see:

1. **Premium Access Banner** (Main Editor Page)
   - A prominent purple gradient banner appears at the top of the editor
   - Shows "🎉 Premium Access Enabled" with an "Active" badge
   - Lists all premium features you can access
   - Appears on all tabs in the catalogue editor

2. **Premium Access Badge** (Team Tab)
   - When viewing the Team Members list, you'll see a "Premium Access" badge next to your name
   - Purple gradient badge with sparkles icon
   - Only visible when plan sharing is enabled

3. **Premium Features Notice** (Team Tab)
   - A detailed card at the top of the Team Members tab
   - Explains that you have premium access
   - Shows grid of available premium features
   - Purple/pink gradient design for visibility

### What Can You Do?

With premium access enabled, you can:
- ✅ Use AI to generate product descriptions
- ✅ Access all premium catalogue templates
- ✅ Export catalogues with premium formatting
- ✅ Use advanced customization features
- ❌ Access only applies to this specific catalogue
- ❌ You still need your own plan for catalogues you own

### Visual Indicators

**In Team Management Tab:**
```
┌──────────────────────────────────────────────────┐
│ 🎉 You have Premium Access!                      │
│                                                  │
│ The catalogue owner has shared their premium     │
│ plan benefits with you for this catalogue.      │
│                                                  │
│ [AI Features] [Premium Export] [Premium Templates]│
└──────────────────────────────────────────────────┘
```

**In Member Card:**
```
John Doe
EDITOR | ✨ Premium Access
john@example.com
```

**In Main Editor:**
```
┌──────────────────────────────────────────────────┐
│ 🎉 Premium Access Enabled [Active]              │
│                                                  │
│ You have access to premium features thanks to   │
│ the owner's subscription!                       │
│                                                  │
│ ✨ AI Features  👑 Premium Templates  ⚡ Export │
└──────────────────────────────────────────────────┘
```

## Technical Details

### Database Schema
- New field: `planSharingEnabled` (Boolean) in Catalogue table
- Default value: `false`
- Catalogue-specific (not global)

### API Endpoints
- `GET /api/catalogues/[id]/plan-sharing` - Get current sharing status
- `PATCH /api/catalogues/[id]/plan-sharing` - Update sharing status
- Both endpoints require owner authentication

### Activity Logging
All plan sharing changes are tracked:
- "Enabled plan sharing for team members"
- "Disabled plan sharing for team members"
- Visible in Activity Log tab with sparkles icon

## Troubleshooting

### I don't see the Plan Sharing card
- Make sure you're the catalogue owner
- Check that you have a premium plan (not FREE)
- Refresh the page if you recently upgraded

### Team members can't see premium access
- Verify plan sharing is enabled in the Team tab
- Check that team members have refreshed their page
- Ensure team members are viewing the correct catalogue

### Premium features not working for team members
- Confirm plan sharing is still enabled
- Check your subscription is active
- Contact support if issues persist

## Best Practices

1. **Communicate with your team** - Let team members know when you enable/disable sharing
2. **Monitor activity logs** - Track who uses premium features
3. **Review permissions regularly** - Ensure team members have appropriate access levels
4. **Use catalogue-specific sharing** - Enable only for catalogues that need collaboration

## FAQ

**Q: Can team members see that I have premium access?**
A: Yes, team members can see the "Premium Access" badge on their own profile in the Team tab.

**Q: Does this affect my subscription billing?**
A: No, sharing your plan benefits doesn't change your subscription cost.

**Q: Can I share with unlimited team members?**
A: The number of team members you can invite depends on your subscription plan.

**Q: What happens if I downgrade my plan?**
A: If you downgrade to FREE, plan sharing will be automatically disabled for all catalogues.

**Q: Can team members share their premium access?**
A: No, only catalogue owners can enable plan sharing. Team members cannot re-share benefits.

## Support

For additional help or questions:
- Check the Activity Log for sharing history
- Review your team member permissions
- Contact support at support@catfy.com
