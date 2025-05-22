
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { SearchSite } from '@/types';
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface SearchSitesStepProps {
  onNext: () => void;
  onBack: () => void;
  sites: SearchSite[];
  onSitesUpdate: (sites: SearchSite[]) => void;
}

interface RankedSearchSite extends SearchSite {
  rank: number;
}

export const SearchSitesStep: React.FC<SearchSitesStepProps> = ({
  onNext,
  onBack,
  sites,
  onSitesUpdate
}) => {
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [rankedSites, setRankedSites] = useState<RankedSearchSite[]>([]);

  // Convert sites to ranked sites
  useEffect(() => {
    if (sites.length === 0) {
      // Default sites with no preference (neutral ranking)
      onSitesUpdate([
        { name: 'Google', url: 'https://google.com', selected: true, rank: 0 },
        { name: 'LinkedIn', url: 'https://linkedin.com', selected: true, rank: 0 },
        { name: 'Crunchbase', url: 'https://crunchbase.com', selected: false, rank: 0 }
      ]);
    } else {
      const ranked = sites.map((site, index) => ({
        ...site,
        rank: site.rank !== undefined ? site.rank : 0
      }));
      setRankedSites(ranked);
    }
  }, [sites, onSitesUpdate]);

  const handleAddSite = () => {
    if (!newSiteName.trim() || !newSiteUrl.trim()) return;
    
    // Simple validation to ensure URL has at least a domain structure
    let url = newSiteUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const newSite: RankedSearchSite = {
      name: newSiteName.trim(),
      url,
      selected: true,
      rank: 0 // Neutral ranking by default
    };
    
    const updatedSites = [...rankedSites, newSite];
    setRankedSites(updatedSites);
    onSitesUpdate(updatedSites);
    
    setNewSiteName('');
    setNewSiteUrl('');
  };

  const toggleSiteSelection = (index: number) => {
    const updatedSites = [...rankedSites];
    updatedSites[index].selected = !updatedSites[index].selected;
    setRankedSites(updatedSites);
    onSitesUpdate(updatedSites);
  };

  const removeSite = (index: number) => {
    const updatedSites = rankedSites.filter((_, i) => i !== index);
    setRankedSites(updatedSites);
    onSitesUpdate(updatedSites);
  };

  const increaseRank = (index: number) => {
    const updatedSites = [...rankedSites];
    updatedSites[index].rank = (updatedSites[index].rank || 0) + 1;
    setRankedSites(updatedSites);
    onSitesUpdate(updatedSites);
  };

  const decreaseRank = (index: number) => {
    const updatedSites = [...rankedSites];
    updatedSites[index].rank = (updatedSites[index].rank || 0) - 1;
    setRankedSites(updatedSites);
    onSitesUpdate(updatedSites);
  };

  // Sort sites by rank (highest to lowest)
  const sortedSites = [...rankedSites].sort((a, b) => {
    const rankA = a.rank || 0;
    const rankB = b.rank || 0;
    return rankB - rankA;
  });

  return (
    <div className="step-container">
      <h2 className="text-center mb-6">Select Search Sites</h2>
      
      <div className="space-y-6">
        <div className="bg-white border rounded-md p-4">
          <h3 className="text-lg font-medium mb-4">Add a new search site</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Site Name"
              value={newSiteName}
              onChange={(e) => setNewSiteName(e.target.value)}
              className="bg-white rounded"
            />
            <Input
              placeholder="Site URL (e.g., https://example.com)"
              value={newSiteUrl}
              onChange={(e) => setNewSiteUrl(e.target.value)}
              className="bg-white rounded"
            />
            <Button onClick={handleAddSite} type="button" className="whitespace-nowrap rounded">
              Add Site
            </Button>
          </div>
        </div>
        
        <div className="bg-white border rounded-md p-4">
          <h3 className="text-lg font-medium mb-4">Selected search sites</h3>
          <p className="text-sm text-gray-500 mb-4">
            Adjust relevance by upvoting or downvoting each site. Sites with higher scores will be prioritized.
          </p>
          <div className="grid grid-cols-1 gap-3">
            {sortedSites.map((site, index) => (
              <Card key={index} className={`${site.selected ? "border-blue-200" : ""} rounded`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col items-center space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => increaseRank(rankedSites.indexOf(site))}
                          className="p-1 h-6 rounded"
                          title="Increase relevance"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <span className={`font-medium ${site.rank > 0 ? "text-green-600" : site.rank < 0 ? "text-red-600" : "text-gray-400"}`}>
                          {site.rank > 0 ? `+${site.rank}` : site.rank}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => decreaseRank(rankedSites.indexOf(site))}
                          className="p-1 h-6 rounded"
                          title="Decrease relevance"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <p className="font-medium">{site.name}</p>
                        <p className="text-sm text-gray-500 truncate">{site.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={site.selected}
                          onCheckedChange={() => toggleSiteSelection(rankedSites.indexOf(site))}
                        />
                        <span className="text-sm text-gray-500">
                          {site.selected ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSite(rankedSites.indexOf(site))}
                        className="text-gray-500 hover:text-red-500 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {rankedSites.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No search sites added. Add at least one site to continue.
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack} className="rounded">
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!rankedSites.some(site => site.selected)}
          className="rounded"
        >
          Next: Start Processing
        </Button>
      </div>
    </div>
  );
};

export default SearchSitesStep;
