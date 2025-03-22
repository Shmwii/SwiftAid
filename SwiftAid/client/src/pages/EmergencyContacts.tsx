import Header from '@/components/Header';
import { useLocation } from 'wouter';
import { 
  ArrowLeft, Phone, Plus, Heart, Shield, 
  Trash2, Edit, Check, X, Save, User, MapPin 
} from 'lucide-react';
import { useState } from 'react';

interface Contact {
  id: number;
  name: string;
  phone: string;
  relationship: string;
  isPrimary?: boolean;
}

export default function EmergencyContacts() {
  const [_, navigate] = useLocation();
  const [editMode, setEditMode] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newContact, setNewContact] = useState<Omit<Contact, 'id'>>({
    name: '',
    phone: '',
    relationship: '',
  });
  
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 1,
      name: 'John Smith',
      phone: '(555) 123-4567',
      relationship: 'Family',
      isPrimary: true
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      phone: '(555) 987-6543',
      relationship: 'Doctor'
    },
    {
      id: 3,
      name: 'Memorial Hospital',
      phone: '(555) 111-2222',
      relationship: 'Hospital'
    }
  ]);

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) return;
    
    setContacts([
      ...contacts,
      {
        id: contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1,
        ...newContact,
        isPrimary: contacts.length === 0 // Make first contact primary
      }
    ]);
    
    setNewContact({
      name: '',
      phone: '',
      relationship: '',
    });
    
    setIsAdding(false);
  };

  const handleEditContact = (id: number, updatedContact: Partial<Contact>) => {
    setContacts(contacts.map(contact => 
      contact.id === id ? { ...contact, ...updatedContact } : contact
    ));
  };

  const handleDeleteContact = (id: number) => {
    setContacts(contacts.filter(contact => contact.id !== id));
  };

  const handleSetPrimary = (id: number) => {
    setContacts(contacts.map(contact => ({
      ...contact,
      isPrimary: contact.id === id
    })));
  };

  return (
    <>
      <Header 
        title="Emergency Contacts" 
        leftIcon={<ArrowLeft className="w-6 h-6" />}
        onLeftIconClick={() => navigate('/')}
      />
      
      <main className="flex-1 p-4 overflow-auto">
        <div className="bg-white rounded-lg shadow-sm mb-5 overflow-hidden">
          <div className="bg-emerald-50 p-4 border-b border-emerald-100">
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-emerald-500 mr-2" />
              <h2 className="font-semibold text-gray-800">Important Contacts</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Your emergency contacts will be notified in case of a medical emergency.
            </p>
          </div>
          
          <div className="divide-y">
            {contacts.map(contact => (
              <div key={contact.id} className="p-4">
                {editMode === contact.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Name</label>
                      <input 
                        type="text" 
                        value={contact.name}
                        onChange={(e) => handleEditContact(contact.id, { name: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                      <input 
                        type="tel" 
                        value={contact.phone}
                        onChange={(e) => handleEditContact(contact.id, { phone: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Relationship</label>
                      <select
                        value={contact.relationship}
                        onChange={(e) => handleEditContact(contact.id, { relationship: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="Family">Family</option>
                        <option value="Friend">Friend</option>
                        <option value="Doctor">Doctor</option>
                        <option value="Hospital">Hospital</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => setEditMode(null)}
                        className="flex-1 py-2 border border-gray-300 rounded-md text-gray-700 font-medium flex items-center justify-center"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </button>
                      <button
                        onClick={() => setEditMode(null)}
                        className="flex-1 py-2 bg-emerald-600 rounded-md text-white font-medium flex items-center justify-center"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-1">
                          <h3 className="font-medium text-gray-900 mr-2">{contact.name}</h3>
                          {contact.isPrimary && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{contact.phone}</p>
                        <p className="text-xs text-gray-500 mt-1">{contact.relationship}</p>
                      </div>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => setEditMode(contact.id)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteContact(contact.id)}
                          className="p-1 text-gray-500 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {!contact.isPrimary && (
                          <button 
                            onClick={() => handleSetPrimary(contact.id)}
                            className="p-1 text-gray-500 hover:text-emerald-500"
                            title="Set as primary contact"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex">
                      <a 
                        href={`tel:${contact.phone.replace(/[^0-9]/g, '')}`}
                        className="flex-1 py-1.5 bg-gray-100 text-gray-800 rounded-md text-sm font-medium flex items-center justify-center"
                      >
                        <Phone className="w-4 h-4 mr-1 text-gray-600" />
                        Call
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {isAdding ? (
            <div className="p-4 border-t">
              <h3 className="font-medium text-gray-900 mb-3">Add New Contact</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Name</label>
                  <input 
                    type="text" 
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    placeholder="Full name"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                  <input 
                    type="tel" 
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Relationship</label>
                  <select
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select relationship</option>
                    <option value="Family">Family</option>
                    <option value="Friend">Friend</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Hospital">Hospital</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-2 border border-gray-300 rounded-md text-gray-700 font-medium flex items-center justify-center"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </button>
                  <button
                    onClick={handleAddContact}
                    className="flex-1 py-2 bg-emerald-600 rounded-md text-white font-medium flex items-center justify-center"
                    disabled={!newContact.name || !newContact.phone}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border-t">
              <button
                onClick={() => setIsAdding(true)}
                className="w-full py-2 border border-dashed border-gray-300 rounded-md text-gray-600 flex items-center justify-center hover:border-emerald-400 hover:text-emerald-600 transition-colors"
              >
                <Plus className="w-5 h-5 mr-1.5" />
                Add Emergency Contact
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-blue-50 p-4 border-b border-blue-100">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-blue-500 mr-2" />
              <h2 className="font-semibold text-gray-800">Emergency Services</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Important numbers to call in case of emergency.
            </p>
          </div>
          
          <div className="divide-y">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">Emergency Services</h3>
                  <p className="text-sm text-gray-600">911</p>
                  <p className="text-xs text-gray-500 mt-1">Police, Fire, Medical</p>
                </div>
              </div>
              <div className="mt-3 flex">
                <a 
                  href="tel:911"
                  className="flex-1 py-1.5 bg-red-100 text-red-800 rounded-md text-sm font-medium flex items-center justify-center"
                >
                  <Phone className="w-4 h-4 mr-1 text-red-700" />
                  Call 911
                </a>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">Poison Control</h3>
                  <p className="text-sm text-gray-600">1-800-222-1222</p>
                  <p className="text-xs text-gray-500 mt-1">Available 24/7</p>
                </div>
              </div>
              <div className="mt-3 flex">
                <a 
                  href="tel:18002221222"
                  className="flex-1 py-1.5 bg-gray-100 text-gray-800 rounded-md text-sm font-medium flex items-center justify-center"
                >
                  <Phone className="w-4 h-4 mr-1 text-gray-600" />
                  Call Poison Control
                </a>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">Suicide Prevention Lifeline</h3>
                  <p className="text-sm text-gray-600">988</p>
                  <p className="text-xs text-gray-500 mt-1">Available 24/7</p>
                </div>
              </div>
              <div className="mt-3 flex">
                <a 
                  href="tel:988"
                  className="flex-1 py-1.5 bg-gray-100 text-gray-800 rounded-md text-sm font-medium flex items-center justify-center"
                >
                  <Phone className="w-4 h-4 mr-1 text-gray-600" />
                  Call Lifeline
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-5">
          <div className="p-4 border-b">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="font-semibold text-gray-800">Your Location</h2>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-2">
              Make sure your location services are enabled so emergency services can find you quickly.
            </p>
            <div className="text-xs bg-gray-100 p-3 rounded-md text-gray-600">
              <p className="font-medium">Stored Address:</p>
              <p className="mt-1">123 Main Street, Apt 4B</p>
              <p>Los Angeles, CA 90001</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}