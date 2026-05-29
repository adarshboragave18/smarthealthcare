from pathlib import Path
text = Path('src/utils/i18n.js').read_text(encoding='utf-8')
keys = ['emergency_women_helpline','emergency_covid_helpline','emergency_child_helpline','emergency_disaster_mgmt','profile_bmi_details']
for key in keys:
    idx = text.find(key)
    print(key, idx)
    if idx >= 0:
        start = text.rfind('\n', 0, idx)
        end = text.find('\n', idx)
        print(repr(text[start+1:end]))
