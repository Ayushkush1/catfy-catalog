import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, X, ChevronUp, ChevronDown } from 'lucide-react';

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[]; // For select, radio, checkbox
  value?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface FormBlockProps {
  fields: FormField[];
  title?: string;
  description?: string;
  submitButtonText?: string;
  submitButtonColor?: string;
  submitButtonTextColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  padding?: number;
  margin?: number;
  width?: string;
  fieldSpacing?: number;
  labelColor?: string;
  inputBackgroundColor?: string;
  inputBorderColor?: string;
  inputTextColor?: string;
  requiredIndicatorColor?: string;
  action?: string;
  method?: 'GET' | 'POST';
}

export const FormBlock: React.FC<FormBlockProps> = ({
  fields = [
    { id: '1', type: 'text', label: 'Name', placeholder: 'Enter your name', required: true },
    { id: '2', type: 'email', label: 'Email', placeholder: 'Enter your email', required: true },
    { id: '3', type: 'textarea', label: 'Message', placeholder: 'Enter your message', required: false }
  ],
  title = 'Contact Form',
  description = 'Please fill out the form below',
  submitButtonText = 'Submit',
  submitButtonColor = '#3b82f6',
  submitButtonTextColor = '#ffffff',
  backgroundColor = '#ffffff',
  borderColor = '#e2e8f0',
  borderRadius = 8,
  padding = 24,
  margin = 0,
  width = '100%',
  fieldSpacing = 16,
  labelColor = '#374151',
  inputBackgroundColor = '#ffffff',
  inputBorderColor = '#d1d5db',
  inputTextColor = '#111827',
  requiredIndicatorColor = '#ef4444',
  action = '#',
  method = 'POST'
}) => {
  const { connectors: { connect, drag } } = useNode();
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});

  const handleInputChange = (fieldId: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // In a real implementation, you would handle form submission here
  };

  const containerStyles = {
    backgroundColor,
    border: `1px solid ${borderColor}`,
    borderRadius: `${borderRadius}px`,
    padding: `${padding}px`,
    margin: `${margin}px`,
    width,
    fontFamily: 'inherit'
  };

  const fieldContainerStyles = {
    marginBottom: `${fieldSpacing}px`
  };

  const labelStyles = {
    display: 'block',
    marginBottom: '6px',
    color: labelColor,
    fontSize: '14px',
    fontWeight: '500'
  };

  const inputStyles = {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: inputBackgroundColor,
    border: `1px solid ${inputBorderColor}`,
    borderRadius: '6px',
    color: inputTextColor,
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  };

  const textareaStyles = {
    ...inputStyles,
    minHeight: '80px',
    resize: 'vertical' as const
  };

  const selectStyles = {
    ...inputStyles,
    cursor: 'pointer'
  };

  const submitButtonStyles = {
    backgroundColor: submitButtonColor,
    color: submitButtonTextColor,
    border: 'none',
    borderRadius: '6px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease'
  };

  const renderField = (field: FormField) => {
    const fieldValue = formData[field.id] || '';

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            style={textareaStyles}
            placeholder={field.placeholder}
            value={fieldValue as string}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
          />
        );

      case 'select':
        return (
          <select
            style={selectStyles}
            value={fieldValue as string}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          >
            <option value="">{field.placeholder || 'Select an option'}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option}
                  checked={(fieldValue as string[])?.includes(option) || false}
                  onChange={(e) => {
                    const currentValues = (fieldValue as string[]) || [];
                    if (e.target.checked) {
                      handleInputChange(field.id, [...currentValues, option]);
                    } else {
                      handleInputChange(field.id, currentValues.filter(v => v !== option));
                    }
                  }}
                />
                <span style={{ color: inputTextColor, fontSize: '14px' }}>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={fieldValue === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                />
                <span style={{ color: inputTextColor, fontSize: '14px' }}>{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type={field.type}
            style={inputStyles}
            placeholder={field.placeholder}
            value={fieldValue as string}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
            pattern={field.validation?.pattern}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );
    }
  };

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      style={containerStyles}
      className="form-block"
    >
      {title && (
        <h2 style={{ color: labelColor, fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
          {title}
        </h2>
      )}
      
      {description && (
        <p style={{ color: labelColor, fontSize: '14px', marginBottom: '24px', opacity: 0.8 }}>
          {description}
        </p>
      )}

      <form onSubmit={handleSubmit} action={action} method={method}>
        {fields.map((field) => (
          <div key={field.id} style={fieldContainerStyles}>
            <label style={labelStyles}>
              {field.label}
              {field.required && (
                <span style={{ color: requiredIndicatorColor, marginLeft: '4px' }}>*</span>
              )}
            </label>
            {renderField(field)}
          </div>
        ))}

        <button
          type="submit"
          style={submitButtonStyles}
          className="hover:opacity-90"
        >
          {submitButtonText}
        </button>
      </form>
    </div>
  );
};

export const FormBlockSettings: React.FC = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props as FormBlockProps
  }));

  const addField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      type: 'text',
      label: `Field ${props.fields.length + 1}`,
      placeholder: 'Enter value',
      required: false
    };
    setProp((props: FormBlockProps) => {
      props.fields.push(newField);
    });
  };

  const removeField = (fieldId: string) => {
    if (props.fields.length > 1) {
      setProp((props: FormBlockProps) => {
        props.fields = props.fields.filter(field => field.id !== fieldId);
      });
    }
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setProp((props: FormBlockProps) => {
      const field = props.fields.find(f => f.id === fieldId);
      if (field) {
        Object.assign(field, updates);
      }
    });
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    setProp((props: FormBlockProps) => {
      const currentIndex = props.fields.findIndex(field => field.id === fieldId);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (newIndex >= 0 && newIndex < props.fields.length) {
        const [movedField] = props.fields.splice(currentIndex, 1);
        props.fields.splice(newIndex, 0, movedField);
      }
    });
  };

  const updateFieldOptions = (fieldId: string, options: string) => {
    const optionsArray = options.split('\n').filter(opt => opt.trim());
    updateField(fieldId, { options: optionsArray });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Form Title</Label>
        <Input
          value={props.title}
          onChange={(e) => setProp((props: FormBlockProps) => props.title = e.target.value)}
          placeholder="Form title"
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Description</Label>
        <Textarea
          value={props.description}
          onChange={(e) => setProp((props: FormBlockProps) => props.description = e.target.value)}
          placeholder="Form description"
          rows={2}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Form Fields</Label>
        <div className="space-y-2 mt-2">
          {props.fields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Field {index + 1}</span>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveField(field.id, 'up')}
                    disabled={index === 0}
                  >
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveField(field.id, 'down')}
                    disabled={index === props.fields.length - 1}
                  >
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeField(field.id)}
                    disabled={props.fields.length <= 1}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select 
                    value={field.type} 
                    onValueChange={(value) => updateField(field.id, { type: value as FormField['type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="password">Password</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="tel">Phone</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                      <SelectItem value="textarea">Textarea</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                      <SelectItem value="radio">Radio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={field.required}
                    onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                  />
                  <Label className="text-xs">Required</Label>
                </div>
              </div>
              
              <div>
                <Label className="text-xs">Label</Label>
                <Input
                  value={field.label}
                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                  placeholder="Field label"
                />
              </div>
              
              <div>
                <Label className="text-xs">Placeholder</Label>
                <Input
                  value={field.placeholder || ''}
                  onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                  placeholder="Field placeholder"
                />
              </div>

              {(field.type === 'select' || field.type === 'checkbox' || field.type === 'radio') && (
                <div>
                  <Label className="text-xs">Options (one per line)</Label>
                  <Textarea
                    value={field.options?.join('\n') || ''}
                    onChange={(e) => updateFieldOptions(field.id, e.target.value)}
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                    rows={3}
                  />
                </div>
              )}
            </div>
          ))}
          
          <Button onClick={addField} variant="outline" size="sm" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Field
          </Button>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Submit Button Text</Label>
        <Input
          value={props.submitButtonText}
          onChange={(e) => setProp((props: FormBlockProps) => props.submitButtonText = e.target.value)}
          placeholder="Submit button text"
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Form Action URL</Label>
        <Input
          value={props.action}
          onChange={(e) => setProp((props: FormBlockProps) => props.action = e.target.value)}
          placeholder="https://example.com/submit"
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Method</Label>
        <Select value={props.method} onValueChange={(value) => setProp((props: FormBlockProps) => props.method = value as any)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium">Border Radius: {props.borderRadius}px</Label>
        <Slider
          value={[props.borderRadius || 0]}
          onValueChange={([value]) => setProp((props: FormBlockProps) => props.borderRadius = value)}
          max={50}
          step={1}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Padding: {props.padding}px</Label>
        <Slider
          value={[props.padding || 0]}
          onValueChange={([value]) => setProp((props: FormBlockProps) => props.padding = value)}
          max={100}
          step={1}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Field Spacing: {props.fieldSpacing}px</Label>
        <Slider
          value={[props.fieldSpacing || 0]}
          onValueChange={([value]) => setProp((props: FormBlockProps) => props.fieldSpacing = value)}
          max={50}
          step={1}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Background Color</Label>
        <Input
          type="color"
          value={props.backgroundColor}
          onChange={(e) => setProp((props: FormBlockProps) => props.backgroundColor = e.target.value)}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Border Color</Label>
        <Input
          type="color"
          value={props.borderColor}
          onChange={(e) => setProp((props: FormBlockProps) => props.borderColor = e.target.value)}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Submit Button Color</Label>
        <Input
          type="color"
          value={props.submitButtonColor}
          onChange={(e) => setProp((props: FormBlockProps) => props.submitButtonColor = e.target.value)}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Submit Button Text Color</Label>
        <Input
          type="color"
          value={props.submitButtonTextColor}
          onChange={(e) => setProp((props: FormBlockProps) => props.submitButtonTextColor = e.target.value)}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Label Color</Label>
        <Input
          type="color"
          value={props.labelColor}
          onChange={(e) => setProp((props: FormBlockProps) => props.labelColor = e.target.value)}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Input Background Color</Label>
        <Input
          type="color"
          value={props.inputBackgroundColor}
          onChange={(e) => setProp((props: FormBlockProps) => props.inputBackgroundColor = e.target.value)}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Input Border Color</Label>
        <Input
          type="color"
          value={props.inputBorderColor}
          onChange={(e) => setProp((props: FormBlockProps) => props.inputBorderColor = e.target.value)}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Width</Label>
        <Input
          value={props.width}
          onChange={(e) => setProp((props: FormBlockProps) => props.width = e.target.value)}
          placeholder="e.g., 100%, 500px, auto"
        />
      </div>
    </div>
  );
};

(FormBlock as any).craft = {
  props: {
    fields: [
      { id: '1', type: 'text', label: 'Name', placeholder: 'Enter your name', required: true },
      { id: '2', type: 'email', label: 'Email', placeholder: 'Enter your email', required: true },
      { id: '3', type: 'textarea', label: 'Message', placeholder: 'Enter your message', required: false }
    ],
    title: 'Contact Form',
    description: 'Please fill out the form below',
    submitButtonText: 'Submit',
    submitButtonColor: '#3b82f6',
    submitButtonTextColor: '#ffffff',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 24,
    margin: 0,
    width: '100%',
    fieldSpacing: 16,
    labelColor: '#374151',
    inputBackgroundColor: '#ffffff',
    inputBorderColor: '#d1d5db',
    inputTextColor: '#111827',
    requiredIndicatorColor: '#ef4444',
    action: '#',
    method: 'POST'
  },
  related: {
    settings: FormBlockSettings
  }
};