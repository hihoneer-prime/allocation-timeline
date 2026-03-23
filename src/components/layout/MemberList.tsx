import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '@/store/useStore'
import { ROLES } from '@/constants'
import { MemberForm } from '@/components/dialogs/MemberForm'
import { MemberChip } from '@/components/layout/MemberChip'
import type { Member } from '@/types'

export function MemberList() {
  const members = useStore((s) => s.members)
  const removeMember = useStore((s) => s.removeMember)
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)

  const openAddForm = () => {
    setEditingMember(null)
    setShowForm(true)
  }

  const openEditForm = (member: Member) => {
    setEditingMember(member)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingMember(null)
  }

  return (
    <div className="p-2 border-b border-slate-200">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">구성원</span>
        <button
          type="button"
          onClick={openAddForm}
          className="rounded bg-slate-600 px-2 py-1 text-xs text-white hover:bg-slate-700"
        >
          + 추가
        </button>
      </div>
      {showForm &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30"
            onClick={closeForm}
          >
            <div
              className="rounded-lg bg-white shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <MemberForm
                member={editingMember ?? undefined}
                onClose={closeForm}
              />
            </div>
          </div>,
          document.body
        )}
      <div className="flex flex-wrap gap-1.5">
        {[...members]
          .sort((a, b) => {
            const roleOrder = (r: string) => {
              const i = ROLES.indexOf(r as (typeof ROLES)[number])
              return i >= 0 ? i : 999
            }
            const cmp = roleOrder(a.role) - roleOrder(b.role)
            return cmp !== 0 ? cmp : a.name.localeCompare(b.name)
          })
          .map((m) => (
            <MemberChip
              key={m.id}
              member={m}
              onRemove={() => removeMember(m.id)}
              onEdit={() => openEditForm(m)}
            />
          ))}
      </div>
    </div>
  )
}
