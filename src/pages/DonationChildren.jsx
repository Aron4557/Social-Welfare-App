// src/pages/DonationChildren.jsx
import DonationCampaign from "../components/DonationCampaign";

export default function DonationChildren() {
  return (
    <DonationCampaign 
      title="Help Children"
      campaign="Children's Education Fund"
      description="Provide education, healthcare, and hope to children in need. Your donation helps us build schools, provide nutritious meals, and ensure every child gets the education they deserve."
      icon="Users"
      color="#FF7A45"
      target="2,500 children"
      goal={100000}
      raised={78500}
      donors={342}
    />
  );
}