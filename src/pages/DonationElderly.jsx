// src/pages/DonationElderly.jsx
import DonationCampaign from "../components/DonationCampaign";

export default function DonationElderly() {
  return (
    <DonationCampaign 
      title="Support Elderly"
      campaign="Elderly Care Program"
      description="Bring comfort and care to seniors who need our support. Your contribution provides healthcare, companionship, and essential supplies for a dignified life."
      icon="Heart"
      color="#3AC4A3"
      target="1,200 seniors"
      goal={75000}
      raised={42300}
      donors={189}
    />
  );
}