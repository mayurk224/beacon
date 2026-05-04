import React, { useState, useRef, useEffect } from "react";
import { useOrganization } from "../organization/useOrganization";
import { Building2, Check, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

export default function OrganizationSwitcher() {
  const { organizations, selectedOrganization, switchOrganization, loading } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return <div className="h-9 w-48 animate-pulse bg-surface-interactive rounded-lg border border-border-primary"></div>;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-48 h-9 px-3 text-sm font-medium border rounded-lg border-border-primary bg-surface hover:bg-surface-interactive text-primary transition-colors"
      >
        <div className="flex items-center gap-2 truncate">
          <Building2 size={16} className="text-muted shrink-0" />
          <span className="truncate">{selectedOrganization?.name || "Select Org"}</span>
        </div>
        <ChevronDown size={16} className="text-muted shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-surface border border-border-primary rounded-lg shadow-lg py-1 z-50">
          <div className="px-3 py-2 text-xs font-semibold text-muted uppercase tracking-wider">
            Organizations
          </div>
          {organizations.length === 0 ? (
            <div className="px-3 py-2 text-sm text-subtle">No organizations found</div>
          ) : (
            organizations.map((org) => (
              <button
                key={org._id}
                onClick={() => {
                  switchOrganization(org._id);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-surface-interactive transition-colors text-primary"
              >
                <span className="truncate">{org.name}</span>
                {selectedOrganization?._id === org._id && <Check size={16} className="text-blue-500 shrink-0" />}
              </button>
            ))
          )}
          <div className="border-t border-border-primary mt-1 pt-1">
            <Link
              to="/home/organizations"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-sm text-center text-blue-500 hover:bg-surface-interactive transition-colors font-medium"
            >
              Manage Organizations
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
