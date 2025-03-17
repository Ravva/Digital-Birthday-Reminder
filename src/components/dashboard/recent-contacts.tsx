import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tables } from "@/types/supabase"
import { formatMonthDay } from "@/utils/utils"

interface RecentContactsProps {
  contacts: Tables<"contacts">[]
}

export function RecentContacts({ contacts }: RecentContactsProps) {
  return (
    <div className="space-y-8">
      {contacts.map((contact) => (
        <div key={contact.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {contact.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{contact.name}</p>
            <p className="text-sm text-muted-foreground">
              День рождения: {formatMonthDay(contact.birth_date)}
            </p>
          </div>
          <div className="ml-auto font-medium">
            {contact.created_at 
              ? new Date(contact.created_at).toLocaleDateString()
              : 'Дата не указана'}
          </div>
        </div>
      ))}
    </div>
  )
}