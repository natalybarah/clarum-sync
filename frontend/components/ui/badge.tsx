
  export type BadgeType= 'confirmed' | 'pending' | 'urgent'

  const BadgeTypeFields: Record<BadgeType, {
    message: string,
    container: string,
    border: string
    dot: string,
    text: string
  }>= {
    confirmed: {
      message: "Confirmed",
      container: "bg-confirmed-bg",
      border: "border-confirmed-border",
      dot: "bg-confirmed-solid",
      text: "text-confirmed-text"

    },

    pending: {
      message: "Pending",
      container: "bg-pending-bg",
      border: "border-pending-border",
      dot: "bg-pending-solid",
      text: "text-pending-text"

    },
    urgent: {
      message: "Urgent",
      container: "bg-urgent-bg",
      border: "border-urgent-border",
      dot: "bg-urgent-solid",
      text: "text-urgent-text"

    }

  }


const Badge=({variant}: {variant: BadgeType})=>{

 

  return (
    <div className={`inline-flex flex-row gap-1 items-center rounded-full  border px-2 py-0.5 ${BadgeTypeFields[variant].container} ${BadgeTypeFields[variant].border}`}>
      <div className={`w-1.5 h-1.5  rounded-2xl ${BadgeTypeFields[variant].dot}`} ></div>
      <span className={` text-[12px]  font-medium ${BadgeTypeFields[variant].text}`}>{BadgeTypeFields[variant].message}</span>
    </div>
  )


}

export default Badge;
