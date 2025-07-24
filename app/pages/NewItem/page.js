'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

export default function ListItemForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formFields, setFormFields] = useState({
    title: '',
    description: '',
    category: '',
    type: '',
    size: '',
    condition: '',
    tags: '',
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormFields((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData();

    for (let key in formFields) {
      if (formFields[key]) {
        formData.append(key, formFields[key]);
      }
    }

    try {
      const res = await fetch('/api/item/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Item submitted successfully');
        setFormFields({
          title: '',
          description: '',
          category: '',
          type: '',
          size: '',
          condition: '',
          tags: '',
          image: null,
        });
      } else {
        toast.error(data.error || data.message || 'Submission failed');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white rounded shadow-md space-y-4 mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">List a New Item</h2>

      <input
        type="text"
        name="title"
        placeholder="Item Title"
        value={formFields.title}
        onChange={handleChange}
        required
        className="w-full p-3 border rounded"
      />

      <textarea
        name="description"
        placeholder="Item Description"
        value={formFields.description}
        onChange={handleChange}
        required
        className="w-full p-3 border rounded"
      />

      {/* Category Dropdown */}
      <select
        name="category"
        value={formFields.category}
        onChange={handleChange}
        required
        className="w-full p-3 border rounded bg-white"
      >
        <option value="" disabled>Select Category</option>
        <option value="Tops">Tops</option>
        <option value="Bottoms">Bottoms</option>
        <option value="Outerwear">Outerwear</option>
        <option value="Footwear">Footwear</option>
        <option value="Ethnic Wear">Ethnic Wear</option>
        <option value="Sportswear">Sportswear</option>
        <option value="Accessories">Accessories</option>
        <option value="Kids">Kids</option>
        <option value="Winterwear">Winterwear</option>
      </select>

      <input
        type="text"
        name="type"
        placeholder="Type (e.g. T-Shirt, Jeans)"
        value={formFields.type}
        onChange={handleChange}
        required
        className="w-full p-3 border rounded"
      />

      <input
        type="text"
        name="size"
        placeholder="Size (e.g. M, L, 32)"
        value={formFields.size}
        onChange={handleChange}
        required
        className="w-full p-3 border rounded"
      />

      <input
        type="text"
        name="condition"
        placeholder="Condition (e.g. New, Like New, Used)"
        value={formFields.condition}
        onChange={handleChange}
        required
        className="w-full p-3 border rounded"
      />

      <input
        type="text"
        name="tags"
        placeholder="Tags (comma separated)"
        value={formFields.tags}
        onChange={handleChange}
        className="w-full p-3 border rounded"
      />

      <input
        type="file"
        name="image"
        accept="image/*"
        onChange={handleChange}
        required
        className="w-full"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3 px-4 rounded text-white font-semibold transition ${
          isSubmitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
        }`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Item'}
      </button>
    </form>
  );
}
