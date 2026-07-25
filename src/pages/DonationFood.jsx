// src/pages/DonationFood.jsx
import DonationCampaign from "../components/DonationCampaign";

export default function DonationFood() {
  return (
    <DonationCampaign 
      title="Feed the Poor"
      campaign="Food Distribution Drive"
      description="Provide meals and basic necessities to those in need. Help us fight hunger by distributing nutritious meals and grocery packages to families facing food insecurity."
      icon="Coffee"
      color="#FFB088"
      target="5,000 meals"
      goal={80000}
      raised={62100}
      donors={276}
    />
  );
}