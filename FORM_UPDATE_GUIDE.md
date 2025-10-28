# React Hook Form Migration Guide

The form has been partially migrated to use **React Hook Form** with **Zod validation**. 

## ✅ Completed:
- Installed `react-hook-form`, `@hookform/resolvers`, and `zod`
- Created Zod validation schema
- Updated form initialization with `useForm` hook
- Updated submit button to use `handleSubmit(onSubmit, onError)`
- Updated `full_name` input as an example

## 🔄 Pattern to Follow for All Inputs:

### TEXT INPUTS:
```jsx
// OLD:
<input
  type="text"
  name="guardian_name"
  value={formData.guardian_name}
  onChange={handleChange}
  // ...other props
/>
{errors.guardian_name && <p className="text-red-600 text-sm mt-1">{errors.guardian_name}</p>}

// NEW:
<input
  type="text"
  {...register('guardian_name')}
  // ...other props (remove name, value, onChange, required)
/>
{errors.guardian_name && <p className="text-red-600 text-sm mt-1">{errors.guardian_name.message}</p>}
```

### SELECT INPUTS:
```jsx
// OLD:
<select
  name="gender"
  value={formData.gender}
  onChange={handleChange}
>

// NEW:
<select {...register('gender')}>
```

### FILE INPUTS:
```jsx
// OLD:
<input
  type="file"
  name="applicant_photo"
  accept="image/*"
  onChange={handleChange}
/>

// NEW:
<input
  type="file"
  {...register('applicant_photo')}
  accept="image/*"
/>
```

### CHECKBOX:
```jsx
// OLD:
<input
  type="checkbox"
  name="declaration"
  checked={formData.declaration}
  onChange={handleChange}
/>

// NEW:
<input
  type="checkbox"
  {...register('declaration')}
/>
```

### RADIO BUTTONS:
```jsx
// OLD:
<input
  type="radio"
  name="is_registered_graduate"
  value={option}
  checked={formData.is_registered_graduate === (option === 'Yes' ? 1 : 0)}
  onChange={handleChange}
/>

// NEW:
<input
  type="radio"
  {...register('is_registered_graduate')}
  value={option === 'Yes' ? 1 : 0}
/>
```

### CONDITIONAL RENDERING:
```jsx
// OLD:
{formData.is_registered_graduate === 1 && (

// NEW:
{isRegisteredGraduate === 1 && (
```

## 📋 Fields to Update:

1. ✅ full_name - DONE
2. ⏳ date_of_birth
3. ⏳ gender
4. ⏳ guardian_name
5. ⏳ nationality
6. ⏳ religion
7. ⏳ email
8. ⏳ mobile_number
9. ⏳ place_of_birth
10. ⏳ community
11. ⏳ mother_tongue
12. ⏳ applicant_photo
13. ⏳ aadhar_number
14. ⏳ aadhar_copy
15. ⏳ residence_certificate
16. ⏳ degree_name
17. ⏳ university_name
18. ⏳ degree_pattern
19. ⏳ convocation_year
20. ⏳ degree_certificate
21. ⏳ is_registered_graduate (radio)
22. ⏳ other_university_certificate
23. � occupation
24. ⏳ address
25. ⏳ signature
26. ⏳ declaration (checkbox)
27. ⏳ lunch_required
28. ⏳ companion_option

## 🎯 Next Steps:

Due to the file size, I recommend:

1. **Option A**: Use Find & Replace in VS Code:
   - Find: `value={formData\.(\w+)}\s*onChange={handleChange}`
   - Replace: `{...register('$1')}`
   
2. **Option B**: I can provide a complete updated file via a new creation

3. **Option C**: Update fields one section at a time

Which approach would you prefer?
