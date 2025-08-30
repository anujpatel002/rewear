'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

export default function ListItemForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formFields, setFormFields] = useState({
    title: '',
    description: '',
    category: '',
    type: '',
    size: '',
    condition: '',
    tags: '',
    points: '',
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
        // Enhanced success message with better styling
        toast.success(data.message || 'Item submitted successfully', {
          position: "top-right",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: {
            fontSize: '16px',
            fontWeight: '500',
          },
          toastId: 'item-success', // Prevent duplicate toasts
        });
        
        // Show success animation
        setShowSuccess(true);
        
        // Reset form with animation feedback
        setFormFields({
          title: '',
          description: '',
          category: '',
          type: '',
          size: '',
          condition: '',
          tags: '',
          points: '',
          image: null,
        });
        
        // Hide success animation after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
        
        // Show additional feedback
        setTimeout(() => {
          toast.info('✅ Form has been reset. You can add another item if needed.', {
            autoClose: 4000,
          });
        }, 1000);
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
    <div className="max-w-xl mx-auto mt-10">
      {/* Success Animation Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center shadow-2xl transform scale-110 transition-all duration-500">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">Success!</h3>
            <p className="text-gray-600">Your item has been submitted for approval</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-6 card space-y-4">
        <h2 className="text-2xl font-bold mb-4 text-center">List a New Item</h2>

      <input
        type="text"
        name="title"
        placeholder="Item Title"
        value={formFields.title}
        onChange={handleChange}
        required
        className="form-input"
      />

      <textarea
        name="description"
        placeholder="Item Description"
        value={formFields.description}
        onChange={handleChange}
        required
        className="form-textarea"
      />

      {/* Category Dropdown */}
      <select
        name="category"
        value={formFields.category}
        onChange={handleChange}
        required
        className="form-select"
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
        className="form-input"
      />

      <input
        type="text"
        name="size"
        placeholder="Size (e.g. M, L, 32)"
        value={formFields.size}
        onChange={handleChange}
        required
        className="form-input"
      />

      <input
        type="text"
        name="condition"
        placeholder="Condition (e.g. New, Like New, Used)"
        value={formFields.condition}
        onChange={handleChange}
        required
        className="form-input"
      />

      <input
        type="text"
        name="tags"
        placeholder="Tags (comma separated)"
        value={formFields.tags}
        onChange={handleChange}
        className="form-input"
      />

      <input
        type="number"
        name="points"
        placeholder="Points (required to swap/buy)"
        value={formFields.points}
        onChange={handleChange}
        min="0"
        className="form-input"
        required
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
        className={`btn btn-primary w-full transition-all duration-300 ${
          isSubmitting 
            ? 'opacity-60 cursor-not-allowed bg-gray-500' 
            : 'hover:scale-105 hover:shadow-lg'
        }`}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Submitting...</span>
          </div>
        ) : (
          'Submit Item'
        )}
      </button>
    </form>
    </div>
  );
}
