import React from "react";
import { UserIcon, EnvelopeIcon, CalendarIcon } from "@heroicons/react/24/outline";

const SellerInfo = ({ seller }) => {
  const formatDate = (date) => {
    if (!date) return 'Recently';
    
    try {
      // Handle Firestore timestamp
      if (date.seconds) {
        return new Date(date.seconds * 1000).toLocaleDateString();
      }
      // Handle regular date
      return new Date(date).toLocaleDateString();
    } catch (error) {
      return 'Recently';
    }
  };

  return (
    <div className="mt-6 p-6 card-base rounded-lg border">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <UserIcon className="w-5 h-5" />
        Seller Information
      </h3>
      
      {seller ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {seller.profileImage ? (
              <img 
                src={seller.profileImage} 
                alt={seller.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-primary" />
              </div>
            )}
            <div>
              <p className="font-medium text-foreground">{seller.fullName || "Anonymous Seller"}</p>
              <p className="text-sm text-muted-foreground">Campus Seller</p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            {seller.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <EnvelopeIcon className="w-4 h-4" />
                <span>{seller.email}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="w-4 h-4" />
              <span>Member since {formatDate(seller.joinedDate)}</span>
            </div>
          </div>

          <div className="pt-3 border-t">
            <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors">
              Contact Seller
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <UserIcon className="w-12 h-12 text-muted mx-auto mb-2" />
          <p className="text-muted-foreground">Seller information not available</p>
        </div>
      )}
    </div>
  );
};

export default SellerInfo;