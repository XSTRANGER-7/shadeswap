import { useState } from 'react';

export default function PersonaList({ personas, activePersona, onSwitchPersona, onCreatePersona }) {
  const [newPersonaName, setNewPersonaName] = useState('');
  const [switchingPersona, setSwitchingPersona] = useState(null);
  const [isCreatingPersona, setIsCreatingPersona] = useState(false);
  
  const handleCreatePersona = async (e) => {
    e.preventDefault();
    if (newPersonaName.trim()) {
      setIsCreatingPersona(true);
      try {
        await onCreatePersona(newPersonaName.trim());
        setNewPersonaName('');
      } catch (error) {
        console.error('Failed to create persona:', error);
      } finally {
        setIsCreatingPersona(false);
      }
    }
  };

  const handleSwitchPersona = async (personaId) => {
    if (personaId === activePersona) return; // Don't switch if already active
    
    setSwitchingPersona(personaId);
    try {
      await onSwitchPersona(personaId);
    } catch (error) {
      console.error('Failed to switch persona:', error);
    } finally {
      setSwitchingPersona(null);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Personas</h3>
      
      {/* List of personas */}
      <div className="space-y-2" role="listbox" aria-label="Personas">
        {personas && personas.length > 0 ? (
          personas.map((persona) => (
            <button
              type="button"
              key={persona.id}
              role="option"
              aria-selected={persona.id === activePersona}
              className={`w-full text-left p-2.5 rounded-lg transition flex items-center gap-3 border relative ${
                persona.id === activePersona
                  ? 'bg-neutral-900/60 border-white/30'
                  : 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800'
              } ${switchingPersona === persona.id ? 'opacity-60' : ''}`}
              onClick={() => handleSwitchPersona(persona.id)}
              disabled={switchingPersona === persona.id}
            >
              <div className="w-8 h-8 rounded-full bg-white text-neutral-900 flex items-center justify-center font-semibold relative" aria-hidden>
                {switchingPersona === persona.id ? (
                  <div className="animate-spin text-lg">⟳</div>
                ) : (
                  persona.name?.charAt(0)?.toUpperCase() || '?'
                )}
              </div>
              <span className="font-medium text-gray-100">
                {switchingPersona === persona.id ? 'Switching...' : persona.name}
              </span>
              {persona.id === activePersona && !switchingPersona && (
                <span className="ml-auto chip">Active</span>
              )}
              {switchingPersona === persona.id && (
                <div className="ml-auto flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              )}
            </button>
          ))
        ) : (
          <div className="text-gray-500 text-center py-6 border border-dashed border-neutral-800 rounded-lg">No personas yet</div>
        )}
      </div>
      
      {/* Create new persona form */}
      <form onSubmit={handleCreatePersona} className="mt-4">
        <div className="flex gap-2">
          <label htmlFor="new-persona" className="sr-only">New persona name</label>
          <input
            id="new-persona"
            type="text"
            value={newPersonaName}
            onChange={(e) => setNewPersonaName(e.target.value)}
            placeholder="New persona name"
            className={`input ${isCreatingPersona ? 'opacity-60' : ''}`}
            disabled={isCreatingPersona}
          />
          <button
            type="submit"
            className="btn btn-primary relative"
            aria-label="Create persona"
            disabled={isCreatingPersona}
          >
            {isCreatingPersona ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Creating...</span>
              </div>
            ) : (
              'Create'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
